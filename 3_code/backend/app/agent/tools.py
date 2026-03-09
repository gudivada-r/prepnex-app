from sqlmodel import Session, select
from typing import List, Dict
from datetime import datetime, timedelta
# from app.auth import engine -- Remove this to avoid circular import if auth imports models
# from app.models import Course -- Remove this too
class LMSTool:
    """LMS Integration Tool using only local DB (Canvas removed)"""
    def __init__(self):
        pass

    async def get_student_grades(self, student_id: str) -> Dict:
        """Fetch grades from local DB (preferred), then Canvas if available."""
        # 1. Try DB first — fastest and always works
        try:
            from app.auth import engine
            from app.models import Course
            with Session(engine) as session:
                statement = select(Course).where(Course.user_id == int(student_id))
                courses = session.exec(statement).all()
                if courses:
                    return {c.name: c.grade for c in courses}
        except Exception as db_err:
            print(f"DB grade lookup failed: {db_err}")

        # 2. No grades available
        return {}

    
    async def get_upcoming_assignments(self, student_id: str) -> List[Dict]:
        """Fetch upcoming assignments."""
        try:
            # Fallback to static mock since LMS is removed
            return [
                {"course": "Chemistry 101", "assignment": "Lab Report", "due_date": (datetime.now() + timedelta(days=2)).isoformat()},
                {"course": "Calculus I", "assignment": "Midterm", "due_date": (datetime.now() + timedelta(days=5)).isoformat()}
            ]
        except Exception:
            return []

class MockSchedulingTool:
    """Mock Scheduling/Calendar Tool"""
    def check_calendar(self, student_id: str) -> List[Dict]:
        return [
            {"event": "Counseling Session", "time": (datetime.now() + timedelta(days=1)).isoformat()},
            {"event": "Add/Drop Deadline", "time": (datetime.now() + timedelta(days=3)).isoformat()}
        ]

class RAGRetriever:
    """Mock RAG Retriever (Placeholder for ChromaDB implementation)"""
    def query(self, query_text: str, category: str = "general") -> str:
        # detailed mock responses based on category
        if category == "admin":
            if "drop" in query_text.lower():
                return "University Policy 3.1: Students may drop a course without penalty up to the 4th week of the semester. After that, a 'W' grade is recorded."
            if "financial aid" in query_text.lower():
                return "Financial Aid Handbook: Students must maintain a 2.0 GPA to remain eligible for federal aid."
        elif category == "wellness":
             return "Counseling Services are available 24/7. Walk-ins welcome at the Student Center, Room 302."
        elif category == "academic":
             return "Tutoring Center: Free math tutoring is available M-F 9am-5pm."
        
        return "No specific documents found."

# Instantiate global tools
lms_tool = LMSTool()
calendar_tool = MockSchedulingTool()
rag_tool = RAGRetriever()
