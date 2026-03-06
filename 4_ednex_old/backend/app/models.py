from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, JSON

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    full_name: Optional[str] = None
    gpa: float = Field(default=0.0)
    on_track_score: int = Field(default=0)
    ai_insight: Optional[str] = Field(default=None)
    is_admin: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    
    chat_sessions: List["ChatSession"] = Relationship(back_populates="user")
    courses: List["Course"] = Relationship(back_populates="user")
    form_requests: List["FormRequest"] = Relationship(back_populates="user")

class ChatSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str = Field(default="New Session")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="chat_sessions")
    messages: List["ChatMessage"] = Relationship(back_populates="session")

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="chatsession.id")
    sender: str  # "user" or "ai"
    content: str # JSON string for AI responses
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    session: ChatSession = Relationship(back_populates="messages")

class Course(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str
    code: str
    grade: str
    credits: int
    suggestion: Optional[str] = Field(default=None)
    
    user: User = Relationship(back_populates="courses")

class Tutor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    subjects: str  # Comma-separated or JSON
    rating: float = 5.0
    reviews: int = 0
    image: str # Initials or URL
    color: str # Hex color

class FormRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    request_type: str # "add" or "drop"
    course_name: str
    course_code: str
    reason: str
    explanation: Optional[str] = None
    status: str = Field(default="pending") # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="form_requests")

class Advisor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str 
    specialty: str
    availability: str
    email: str
    image: Optional[str] = None

class StudyGroup(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    course_code: str
    topic: str
    schedule: str  # e.g., "Mondays 5PM"
    location: str  # e.g., "Library Room 304"
    members_count: int = Field(default=1)
    max_members: int = Field(default=5)
    created_by: int = Field(foreign_key="user.id")

class Mentorship(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mentor_id: int = Field(foreign_key="user.id")
    mentor_name: str
    specialty: str # e.g. "Computer Science", "Career Advice"
    bio: str
    availability: str
    
class MarketplaceItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    seller_id: int = Field(foreign_key="user.id")
    seller_name: str
    title: str
    price: float
    condition: str # "New", "Good", "Fair"
    image_url: Optional[str] = None
    status: str = Field(default="available") # available, sold
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LectureNote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str  # Auto-generated or user-provided
    course_name: Optional[str] = None
    professor_name: Optional[str] = None
    transcript: str  # Full transcription
    summary: str  # JSON array of key takeaways
    language: str = Field(default="English")
    duration_seconds: int = Field(default=0)
    is_bookmarked: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Career Success Models

class Employer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    industry: str
    location: str
    description: Optional[str] = None

class JobPosting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employer_id: int = Field(foreign_key="employer.id")
    title: str
    required_skills: List[str] = Field(sa_column=Column(JSON))
    min_gpa: float = 0.0
    required_courses: List[str] = Field(sa_column=Column(JSON))

class StudentProfile(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    gpa: float = Field(default=0.0)
    completed_courses: List[str] = Field(sa_column=Column(JSON))
    skills: List[str] = Field(sa_column=Column(JSON))
