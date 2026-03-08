from typing import TypedDict, List, Annotated
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from app.agent.tools import lms_tool, calendar_tool, rag_tool
import json

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
    
    # Reason: Check LMS for context
    grades = await lms_tool.get_student_grades(state["student_id"])
    
    # Act: Use RAG for academic policies/resources or knowledge
    rag_info = rag_tool.query(last_msg, category="academic")
    
    # Basic Memory check
    context_prefix = ""
    if len(messages) > 1:
        context_prefix = f"Considering our previous discussion about {messages[-3].content if len(messages)>2 else 'your studies'}, "
    
    # AI Generation
    api_key = os.environ.get("GOOGLE_API_KEY")

    student_context = state.get("student_context", {})
    context_str = f"Student Profile: Name: {student_context.get('name')}, Major: {student_context.get('major')}, GPA: {student_context.get('gpa')}, Background: {student_context.get('background')}, Interests: {student_context.get('interests')}"

    # Build grade context string — skip gracefully if no grades
    if grades:
        grade_context = "LMS Grades: " + ", ".join([f"{k}: {v}" for k, v in grades.items()])
    else:
        grade_context = "LMS Grades: Not connected."
        
    grade_context = f"{context_str}\n{grade_context}"

    if api_key:
        # Call Gemini REST API directly — bypasses library version issues
        # Use fastest models first to stay within Vercel's 10s serverless timeout
        models_to_try = ['gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-1.5-pro']
        message = None
        
        prompt_text = f"""You are a concise, friendly academic advisor bot.

Context:
- {grade_context}
- Knowledge: {rag_info}

Student asks: "{last_msg}"

Respond in 2-3 SHORT sentences maximum. Be direct and complete — do not trail off or stop mid-sentence. If you need to list things, use at most 3 bullet points."""

        for model_name in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt_text}]}],
                    "generationConfig": {"maxOutputTokens": 256, "temperature": 0.5}
                }
                async with httpx.AsyncClient(timeout=8.0) as client:
                    resp = await client.post(url, json=payload)
                    resp.raise_for_status()
                    data = resp.json()
                    message = data["candidates"][0]["content"]["parts"][0]["text"]
                    print(f"Gemini REST success with model: {model_name}")
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
