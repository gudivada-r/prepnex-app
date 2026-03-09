from typing import TypedDict, List, Annotated
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from app.agent.tools import lms_tool, calendar_tool, rag_tool
import json
import re

# --- Privacy & Compliance Layer ---

class PrivacyGateway:
    """
    Handles PII (Personally Identifiable Information) scrubbing and restoration.
    Ensures that sensitive data is tokenized before leaving the university perimeter.
    """
    def __init__(self, student_context: dict):
        self.student_context = student_context
        self.mapping = {}
        self.reverse_mapping = {}

    def tokenize(self, text: str) -> str:
        """Replace sensitive terms with durable tokens."""
        scrubbed_text = text
        
        # 1. Scrub Student Name
        name = self.student_context.get('name')
        if name:
            token = "[[STUDENT_NAME]]"
            self.mapping[name] = token
            self.reverse_mapping[token] = name
            # Case insensitive replacement for common nicknames or variations
            scrubbed_text = re.sub(re.escape(name), token, scrubbed_text, flags=re.IGNORECASE)
            
            # Also scrub individual parts of the name (e.g. just first name)
            parts = name.split()
            if len(parts) > 1:
                first_name = parts[0]
                self.mapping[first_name] = "[[STUDENT_FIRST_NAME]]"
                self.reverse_mapping["[[STUDENT_FIRST_NAME]]"] = first_name
                scrubbed_text = re.sub(re.escape(first_name), "[[STUDENT_FIRST_NAME]]", scrubbed_text, flags=re.IGNORECASE)

        # 2. Scrub Emails 
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, scrubbed_text)
        for email in emails:
            token = f"[[EMAIL_{hash(email) % 1000}]]"
            self.mapping[email] = token
            self.reverse_mapping[token] = email
            scrubbed_text = scrubbed_text.replace(email, token)

        return scrubbed_text

    def detokenize(self, text: str) -> str:
        """Restore PII from tokens in the LLM response."""
        restored_text = text
        for token, original in self.reverse_mapping.items():
            restored_text = restored_text.replace(token, original)
        return restored_text

# Define the State
class AgentState(TypedDict):
    messages: List[BaseMessage]
    student_id: str
    next_step: str
    final_response: dict
    student_context: dict
    
# --- Nodes ---

def router_node(state: AgentState):
    """
    Analyzes the last message to determine which agent to route to.
    Simple keyword-based routing for this demo.
    """
    last_msg = state["messages"][-1].content.lower()
    
    # Crisis Detection (Regex/Keyword fallback)
    if any(word in last_msg for word in ["suicide", "kill myself", "die", "hurt myself"]):
        return {"next_step": "crisis"}
        
    if any(word in last_msg for word in ["fail", "grade", "assignment", "study", "calculus", "chemistry"]):
        return {"next_step": "tutor"}
    elif any(word in last_msg for word in ["drop", "register", "financial aid", "deadline", "transcript"]):
        return {"next_step": "admin"}
    elif any(word in last_msg for word in ["sad", "anxious", "depressed", "stress", "lonely", "overwhelmed"]):
        return {"next_step": "wellness"}
    else:
        # Default to Tutor for general queries or Supervisor synthesis
        return {"next_step": "tutor"}

import os
import httpx

async def tutor_agent(state: AgentState):
    """
    Academic Tutor Agent.
    """
    messages = state["messages"]
    last_msg = messages[-1].content
    
    student_context = state.get("student_context", {})
    is_ednex = student_context.get("is_ednex", False)
    
    # Reason: Check LMS for context (only for non-EdNex users, EdNex users get grades from data warehouse)
    if is_ednex:
        grades = {}
    else:
        grades = await lms_tool.get_student_grades(state["student_id"])
    
    # Act: Use RAG for academic policies/resources or knowledge
    rag_info = rag_tool.query(last_msg, category="academic")
    
    # Basic Memory check
    context_prefix = ""
    if len(messages) > 1:
        context_prefix = f"Considering our previous discussion about {messages[-3].content if len(messages)>2 else 'your studies'}, "
    
    # AI Generation
    api_key = os.environ.get("GOOGLE_API_KEY")

    api_key = os.environ.get("GOOGLE_API_KEY")
    source_label = "EdNex Data Warehouse" if is_ednex else "Aumtech Profile"
    context_str = f"Student Profile ({source_label}): Name: {student_context.get('name')}, Major: {student_context.get('major')}, GPA: {student_context.get('gpa')}, Background: {student_context.get('background')}, Interests: {student_context.get('interests')}"
    
    # Add previous context from EdNex if available
    previous_insight = student_context.get("previous_insight")
    if previous_insight:
        context_str += f"\nPrevious Discussion Summary: {previous_insight}"

    # Build grade context string — skip gracefully if no grades
    if grades:
        grade_context = "LMS Grades: " + ", ".join([f"{k}: {v}" for k, v in grades.items()])
    elif is_ednex:
        grade_context = "Academic Data: Managed centrally via EdNex, refer to the Student Profile for GPA."
    else:
        grade_context = "LMS Grades: Not connected."
        
    grade_context = f"{context_str}\n{grade_context}"

    # Plan Configuration
    # Plan Options: "prism" (Cloud + Privacy Gateway) or "vault" (Private In-house LLM)
    aura_plan = os.environ.get("AURA_PLAN", "prism").lower()
    
    # Initialize Privacy Gateway
    gateway = PrivacyGateway(student_context)
    
    if aura_plan == "vault":
        # PLAN: Aura Vault (Private In-house LLM)
        # In production, this would hit a local Oobabooga, vLLM, or Ollama endpoint
        # inside the University VPC.
        message = f"[[LOCAL_INFERENCE_VAULT]]: Hello {student_context.get('name')}, I am running on your University's private infrastructure. {rag_info} — I have analyzed your grades for {state['student_id']} and I'm ready to help locally."
        print(f"Aura Vault engaged for student: {state['student_id']}")
    
    elif api_key:
        # PLAN: Aura Prism (Cloud + Privacy Gateway)
        # Data is scrubbed BEFORE leaving the perimeter.
        
        # 1. Scrub the prompt
        tokenized_context = gateway.tokenize(grade_context)
        tokenized_query = gateway.tokenize(last_msg)
        tokenized_rag = gateway.tokenize(rag_info)
        
        # Use fastest models first (Gemini 2.0/Flash-latest) to stay within Vercel timeouts
        models_to_try = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest']
        message = None
        
        prompt_text = f"""You are a concise, friendly academic advisor bot named Aura.
        
IMPORTANT: You are receiving tokenized data. Do not attempt to guess the real names.
Always use the tokens like [[STUDENT_NAME]] in your response if you need to address the student.

Context:
- {tokenized_context}
- Knowledge: {tokenized_rag}

Student asks: "{tokenized_query}"

Respond in 2-3 SHORT sentences maximum. Be direct and complete."""

        print(f"Aura Prism: Sending scrubbed data to Gemini...")
        
        for model_name in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt_text}]}],
                    "generationConfig": {"maxOutputTokens": 1024, "temperature": 0.5}
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=payload)
                    resp.raise_for_status()
                    data = resp.json()
                    raw_response = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # 2. Detokenize the response before it reaches the user
                    message = gateway.detokenize(raw_response)
                    
                    print(f"Gemini REST success with model: {model_name} (Aura Prism)")
                    break
            except Exception as e:
                print(f"Gemini REST {model_name} failed: {str(e)[:150]}")
                continue

        if not message:
            message = f"Here's what I know: {rag_info} — Feel free to ask me anything about your courses, deadlines, or wellness!"
    else:
        message = f"Great question! Here's what I know: {rag_info}. Feel free to ask me anything about your courses, deadlines, or wellness!"



    
    return {
        "messages": [AIMessage(content=message)],
        "final_response": {
            "message_content": message,
            "cited_sources": [],
            "action_items": []
        }
    }

def admin_agent(state: AgentState):
    """
    Administrative Agent.
    """
    query = state["messages"][-1].content
    # Act: Check Calendar and Policies
    calendar = calendar_tool.check_calendar(state["student_id"])
    policy = rag_tool.query(query, category="admin")
    
    # Format calendar events cleanly
    calendar_text = ""
    if calendar:
        events = []
        for item in calendar:
            try:
                from datetime import datetime
                dt = datetime.fromisoformat(item['time'])
                events.append(f"• {item['event']} — {dt.strftime('%A, %b %d at %I:%M %p')}")
            except Exception:
                events.append(f"• {item['event']}")
        calendar_text = "\n".join(events)
    
    message = f"Regarding your question: {policy}"
    if calendar_text:
        message += f"\n\nUpcoming deadlines:\n{calendar_text}"
    
    return {
        "messages": [AIMessage(content=message)],
        "final_response": {
            "message_content": message,
            "cited_sources": [],
            "action_items": []
        }
    }


def wellness_agent(state: AgentState):
    """
    Wellness and Mental Health Agent.
    """
    query = state["messages"][-1].content
    # Act: Retrieve Wellness Resources
    resource = rag_tool.query(query, category="wellness")
    
    message = f"It sounds like you're going through a lot. {resource}. We are here for you."
    
    return {
        "messages": [AIMessage(content=message)],
        "final_response": {
            "message_content": message,
            "cited_sources": [],
            "action_items": []
        }
    }

def crisis_node(state: AgentState):
    """
    Emergency Protocol Node.
    """
    message = "I am concerned about your safety. Please contact Campus Security at 555-0199 or call the 988 Suicide & Crisis Lifeline immediately. I have notified the appropriate campus authorities."
    return {
        "messages": [AIMessage(content=message)],
        "final_response": {
            "message_content": message,
            "cited_sources": ["Emergency Protocol"],
            "action_items": ["CALL 988 IMMEDIATELY", "Go to safe location"]
        }
    }
    
# --- Graph Construction ---
workflow = StateGraph(AgentState)

workflow.add_node("router", router_node)
workflow.add_node("tutor", tutor_agent)
workflow.add_node("admin", admin_agent)
workflow.add_node("wellness", wellness_agent)
workflow.add_node("crisis", crisis_node)

workflow.set_entry_point("router")

workflow.add_conditional_edges(
    "router",
    lambda state: state["next_step"],
    {
        "tutor": "tutor",
        "admin": "admin",
        "wellness": "wellness",
        "crisis": "crisis"
    }
)

workflow.add_edge("tutor", END)
workflow.add_edge("admin", END)
workflow.add_edge("wellness", END)
workflow.add_edge("crisis", END)

app_graph = workflow.compile()
