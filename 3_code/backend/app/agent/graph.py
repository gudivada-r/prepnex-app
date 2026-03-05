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
import google.generativeai as genai

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
    if api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-flash-latest')
            
            prompt = f"""
            You are an expert academic tutor and advisor.
            
            Context:
            - Student Grades: {grades}
            - Institutional Knowledge: {rag_info}
            - Conversation Context: {context_prefix}
            
            Student Query: "{last_msg}"
            
            Provide a helpful, encouraging, and specific response. 
            If their grades are low, suggest specific actions based on the "Institutional Knowledge".
            Keep the tone supportive.
            """
            
            response = model.generate_content(prompt)
            message = response.text
        except Exception as e:
            print(f"Agent AI Gen Failed: {e}")
            message = f"{context_prefix}I see your grades are: {grades}. Based on '{last_msg}', here is some info: {rag_info}. Let's make a study plan."
    else:
        message = f"{context_prefix}I see your grades are: {grades}. Based on '{last_msg}', here is some info: {rag_info}. Let's make a study plan."
    
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
    
    message = f"Regarding '{query}': {policy}. Upcoming deadlines: {calendar}"
    
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
