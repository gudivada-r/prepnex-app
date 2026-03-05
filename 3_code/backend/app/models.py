from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    full_name: Optional[str] = None
    major: Optional[str] = None
    background: Optional[str] = None
    interests: Optional[str] = None
    gpa: float = Field(default=0.0)
    on_track_score: int = Field(default=0)
    ai_insight: Optional[str] = Field(default=None)
    is_admin: bool = Field(default=False)
    is_faculty: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=False)
    
    # Subscription fields
    trial_ends_at: Optional[datetime] = Field(default=None)
    subscription_status: str = Field(default="trialing") # trialing, active, canceled, expired
    stripe_customer_id: Optional[str] = Field(default=None)
    stripe_subscription_id: Optional[str] = Field(default=None)
    
    chat_sessions: List["ChatSession"] = Relationship(back_populates="user")
    courses: List["Course"] = Relationship(back_populates="user")
    form_requests: List["FormRequest"] = Relationship(back_populates="user")
    holds: List["StudentHold"] = Relationship(back_populates="user")

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
    action_items: Optional[str] = Field(default=None) # JSON array of tasks
    keywords: Optional[str] = Field(default=None) # JSON array of terms
    follow_up_questions: Optional[str] = Field(default=None) # JSON array of questions
    language: str = Field(default="English")
    duration_seconds: int = Field(default=0)
    is_bookmarked: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StudentHold(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    item_type: str = Field(default="hold") # "hold", "alert", "task"
    category: str = Field(default="Administrative") # "Financial", "Academic", "Administrative"
    title: str
    description: str
    amount: float = Field(default=0.0)
    status: str = Field(default="active") # "active", "resolved", "completed"
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="holds")

class Scholarship(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    amount: float
    deadline: datetime
    requirements: str # Criteria description
    category: str # "Merit", "Need-based", "Diversity", "STEM"
    provider: str

class PersonalizedStatement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    scholarship_id: int = Field(foreign_key="scholarship.id")
    draft_content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Campaign(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    admin_id: int = Field(foreign_key="user.id")
    title: str
    message: str
    filters_json: str # JSON string of filters used
    target_count: int
    sent_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active") # active, completed, cancelled


# --- Tutoring System Models (Added for Phase 1) ---

class TutoringCourse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True) # e.g. "CS101"
    name: str # "Intro to CS"
    department: str

class TutoringSection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    course_id: int = Field(foreign_key="tutoringcourse.id")
    instructor_id: int = Field(foreign_key="user.id") # Faculty
    term: str = Field(default="Spring 2026")

class TutoringEnrollment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    section_id: int = Field(foreign_key="tutoringsection.id")
    role: str = Field(default="student") # student, ta

class TutoringAppointment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="user.id")
    tutor_id: int = Field(foreign_key="user.id")
    section_id: int = Field(foreign_key="tutoringsection.id")
    start_time: datetime
    end_time: datetime
    status: str = Field(default="scheduled") # scheduled, completed, cancelled
    triage_note: Optional[str] = None
    triage_image_url: Optional[str] = None
    ai_summary: Optional[str] = None # Logic analysis of the problem
