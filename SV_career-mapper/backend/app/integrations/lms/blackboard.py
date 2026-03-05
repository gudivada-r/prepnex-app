
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class BlackboardService:
    """
    Service for interacting with the Blackboard Learn REST API.
    """
    def __init__(self, base_url: Optional[str] = None, access_token: Optional[str] = None):
        self.base_url = (base_url or "https://blackboard.univ.edu/learn/api/public/v1").rstrip('/')
        self.access_token = access_token
        # In actual Blackboard, it uses Bearer tokens, but the auth flow is complex (Oauth2).
        # We assume we have a valid access_token.
        self.headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
        self.is_mock = True # Default to Mock for now as we don't have a real BB instance to verify
        
    async def get_courses(self) -> List[Dict[str, Any]]:
        """Fetch list of courses for the authenticated user from Blackboard."""
        if self.is_mock:
            return [
                {"id": "_123_1", "courseId": "BB-HIST-101", "name": "History of Blackboard (Mock)"},
                {"id": "_124_1", "courseId": "BB-CS-101", "name": "Computer Science I (Mock)"},
                {"id": "_125_1", "courseId": "BB-ENG-202", "name": "Literature and Composition (Mock)"}
            ]
        # Real implementation would call GET /learn/api/public/v1/users/{userId}/courses
        return []

    async def get_course_grades(self, target_student_email: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        """
        Fetch current grades. Blackboard structure is quite which different from Canvas.
        Returns mapped by course name.
        """
        if self.is_mock:
            return {
                "History of Blackboard (Mock)": {"grade": "A-", "score": 91.5},
                "Computer Science I (Mock)": {"grade": "B+", "score": 88.0},
                "Literature and Composition (Mock)": {"grade": "C", "score": 75.0}
            }
        return {}

    def generate_ai_suggestion(self, course_name: str, grade: str) -> str:
        """
        Simulates AI Agent analysis (shared logic could be extracted to a utility).
        """
        subject = course_name.lower()
        
        # Simplified logic compared to CanvasService for brevity, but same principle
        if grade.startswith("A") or grade.startswith("B"):
            return "Good progress. Keep checking the discussion board for peer updates."
        elif grade.startswith("C"):
            return "You are passing, but consider reviewing the lecture recordings again."
        elif grade.startswith("D") or grade.startswith("F"):
            return "At risk. Please contact your instructor via Blackboard Messages immediately."
        else:
            return "Check the syllabus for upcoming milestones."

    async def sync_to_db(self, user_id: int, db_session):
        """
        Synchronizes Blackboard data.
        """
        from app.models import Course, User
        from sqlmodel import select
        import logging

        logger = logging.getLogger("uvicorn")
        logger.info(f"Starting Blackboard Sync for user_id={user_id}...")

        courses_data = await self.get_courses()
        grades_map = await self.get_course_grades()
        synced_count = 0
        
        for c_data in courses_data:
            name = c_data.get("name")
            code = c_data.get("courseId")
            
            if not name: continue

            statement = select(Course).where(Course.user_id == user_id, Course.code == code)
            existing = db_session.exec(statement).first()

            grade_info = grades_map.get(name, {})
            current_grade = grade_info.get("grade", "N/A")
            suggestion = self.generate_ai_suggestion(name, current_grade)
            
            if not existing:
                new_course = Course(
                    user_id=user_id,
                    name=name,
                    code=code,
                    grade=str(current_grade),
                    credits=3,
                    suggestion=suggestion
                )
                db_session.add(new_course)
                synced_count += 1
            else:
                existing.grade = str(current_grade)
                existing.suggestion = suggestion
                db_session.add(existing)
                synced_count += 1
        
        db_session.commit()
        return synced_count
