from sqlmodel import Session, select
from typing import List, Dict
from datetime import datetime, timedelta
# from app.auth import engine -- Remove this to avoid circular import if auth imports models
# from app.models import Course -- Remove this too
from app.integrations.lms.canvas import CanvasService

class LMSTool:
    """LMS Integration Tool bridging local DB and Canvas API"""
    def __init__(self):
        import os
        from dotenv import load_dotenv
        load_dotenv(override=True)
        
        token = os.getenv("CANVAS_API_TOKEN")
        base_url = os.getenv("CANVAS_BASE_URL")
        
        # Fallback: Manually read .env if os.getenv failed
        if not token:
            print("DEBUG: LMSTool os.getenv failed, reading .env manually...")
            try:
                with open(".env", "r") as f:
                    for line in f:
                        if line.startswith("CANVAS_API_TOKEN="):
                            token = line.split("=", 1)[1].strip()
                        elif line.startswith("CANVAS_BASE_URL="):
                            base_url = line.split("=", 1)[1].strip()
            except Exception as e:
                print(f"DEBUG: LMSTool manual .env read failed: {e}")
        
        if not token:
            # Final emergency fallback for demo only
            # Final emergency fallback for demo only
            token = ""
            
        self.canvas = CanvasService(base_url=base_url, access_token=token)

    async def get_student_grades(self, student_id: str) -> Dict:
        """Fetch actual grades from the LMS (priority) or database."""
        try:
            # 1. Try Live LMS Fetch
            if not self.canvas.is_mock:
                print("Fetching live grades from Canvas...")
                lms_grades = await self.canvas.get_course_grades()
                if lms_grades:
                    # Format for agent: "Math: 95% (A)"
                    return {name: f"{data['score']}% ({data['grade']})" for name, data in lms_grades.items()}

            # 2. Fallback to DB
            from app.auth import engine
            from app.models import Course
            with Session(engine) as session:
                statement = select(Course).where(Course.user_id == int(student_id))
                courses = session.exec(statement).all()
                if not courses:
                    # 3. Fallback to Mock Canvas data if DB is empty and no live connection
                    mock_courses = await self.canvas.get_courses()
                    return {c["name"]: "N/A" for c in mock_courses}
                
                return {c.name: c.grade for c in courses}
        except Exception as e:
            return {"Error": f"Could not fetch grades: {str(e)}"}
    
    async def get_upcoming_assignments(self, student_id: str) -> List[Dict]:
        """Fetch upcoming assignments from Canvas."""
        try:
            # In a real app, we'd iterate over student's courses
            events = await self.canvas.get_upcoming_events()
            if events:
                return events
            
            # Fallback to static mock if service returns nothing
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
