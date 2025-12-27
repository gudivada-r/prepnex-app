from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from typing import List

from app.auth import get_session, User, create_access_token, get_password_hash, verify_password, get_current_user
from app.models import ChatSession, ChatMessage, Tutor
from app.agent.graph import app_graph
from langchain_core.messages import HumanMessage

router = APIRouter()

# --- Auth Endpoints ---

@router.post("/auth/register")
async def register(user: User, session: Session = Depends(get_session)):
    try:
        statement = select(User).where(User.email == user.email)
        existing_user = session.exec(statement).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user.password_hash = get_password_hash(user.password_hash)
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"message": "User created successfully"}
    except Exception as e:
        # Return the error message to help debug 500 errors
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    try:
        statement = select(User).where(User.email == form_data.username)
        user = session.exec(statement).first()
        
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Chat Endpoints ---

@router.post("/chat/query")
async def query_agent(
    query: str, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Main endpoint to interact with the AntiGravity Agent.
    """
    # 1. Create a simplified conversation state (in a real app, load history)
    inputs = {
        "messages": [HumanMessage(content=query)],
        "student_id": str(current_user.id),
        "next_step": "",
        "final_response": {}
    }
    
    # 2. Invoke the graph
    result = app_graph.invoke(inputs)
    final_response = result.get("final_response", {})
    
    # 3. Store in DB (Simplified)
    # db_msg = ChatMessage(session_id=1, sender="user", content=query)
    # session.add(db_msg)
    # ... save AI response ...
    
    return final_response

@router.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- Scheduling Endpoints ---

from pydantic import BaseModel

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    gpa: Optional[float] = None
    on_track_score: Optional[int] = None

@router.put("/users/me")
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.gpa is not None:
        current_user.gpa = user_update.gpa
    if user_update.on_track_score is not None:
        current_user.on_track_score = user_update.on_track_score
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

class BookingRequest(BaseModel):
    advisor_name: str
    date: str
    time: str
    reason: str

@router.post("/schedule/book")
async def book_appointment(
    request: BookingRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # In a real app, save to DB and checking availability
    return {
        "status": "confirmed",
        "details": f"Appointment confirmed with {request.advisor_name} on {request.date} at {request.time}.",
        "action": "Calendar Invite Sent"
    }

# --- Course Endpoints ---

from app.models import Course

@router.get("/courses", response_model=List[Course])
async def get_courses(
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    statement = select(Course).where(Course.user_id == current_user.id)
    courses = session.exec(statement).all()
    return courses

@router.post("/courses", response_model=Course)
async def create_course(
    course: Course, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    course.user_id = current_user.id
    session.add(course)
    session.commit()
    session.refresh(course)
    return course

@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: int, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    statement = select(Course).where(Course.id == course_id, Course.user_id == current_user.id)
    course = session.exec(statement).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    session.delete(course)
    session.commit()
    return {"message": "Course deleted"}

# --- Tutor Endpoints ---

@router.get("/tutors", response_model=List[Tutor])
async def get_tutors(
    session: Session = Depends(get_session)
):
    statement = select(Tutor)
    tutors = session.exec(statement).all()
    return tutors
