import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class CanvasService:
    """
    Service for interacting with the Canvas LMS API.
    """
    def __init__(self, base_url: Optional[str] = None, access_token: Optional[str] = None):
        self.base_url = (base_url or "https://canvas.instructure.com/api/v1").rstrip('/')
        self.access_token = access_token
        self.headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
        # STRICTLY DISABLE MOCK MODE
        # The user's env loading issues were causing this to flip to True, injecting bad data.
        self.is_mock = False 
        
        if not access_token:
            logger.warning("CanvasService initialized without token! API calls will fail, but Mock data is disabled.")

    async def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        if self.is_mock:
            return self._get_mock_data(endpoint, params)
        
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        async with httpx.AsyncClient() as client:
            try:
                # logger.info(f"Canvas GET: {url} | Params: {params}")
                response = await client.get(url, headers=self.headers, params=params, timeout=10.0)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Canvas API error: {e.response.status_code} - {e.response.text}")
                raise
            except Exception as e:
                logger.error(f"Canvas connection error: {repr(e)}")
                raise

    async def get_courses(self, enrollment_state: str = "active") -> List[Dict[str, Any]]:
        """Fetch list of courses for the authenticated user."""
        return await self._get("courses", params={"enrollment_state": enrollment_state})

    async def get_assignments(self, course_id: int) -> List[Dict[str, Any]]:
        """Fetch assignments for a specific course."""
        return await self._get(f"courses/{course_id}/assignments")

    async def get_upcoming_events(self) -> List[Dict[str, Any]]:
        """Fetch upcoming events from the user's planner/calendar."""
        return await self._get("planner/items")

    async def get_course_details(self, course_id: int) -> Dict[str, Any]:
        """Fetch details for a specific course."""
        return await self._get(f"courses/{course_id}")

    async def get_course_grades(self) -> Dict[str, Dict[str, Any]]:
        """
        Fetch current grades for all active courses.
        Returns a dict mapped by course name: {'grade': 'A', 'score': 95.0}
        """
        # Canvas API 'courses' endpoint is already scoped to the token owner,
        # so we process all returned courses directly.
        
        # include[] must be passed exactly as Canvas expects
    async def get_student_grade(self, course_id: int, student_email: str) -> Optional[Dict]:
        """
        For teachers: Search for a specific student by email and get their grade.
        """
        try:
            # Search for the user by email
            params = {
                "search_term": student_email,
                "include[]": ["enrollments", "email", "avatar_url"] 
            }
            users = await self._get(f"courses/{course_id}/search_users", params=params)
            
            target_user = None
            if users and isinstance(users, list) and len(users) > 0:
                # Try to exact match email first
                for u in users:
                    u_email = u.get("email", "").lower()
                    u_login = u.get("login_id", "").lower()
                    search = student_email.lower()
                    
                    if search == u_email or search == u_login:
                        target_user = u
                        break
                
                # Fallback to first result if strict match fails (search_term is usually good)
                if not target_user:
                    target_user = users[0]

                enrollments = target_user.get("enrollments", [])
                
                for e in enrollments:
                    # Canvas 'search_users' nests grades inside a 'grades' dict
                    if e.get("type") == "StudentEnrollment":
                        grades = e.get("grades", {})
                        return {
                            "grade": grades.get("current_grade"), 
                            "score": grades.get("current_score")
                        }
        except Exception as e:
           logger.warning(f"Error fetching grade for student {student_email} in course {course_id}: {e}")
        
        return None

    async def get_course_grades(self, target_student_email: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        """
        Fetch current grades for all active courses.
        If a target_student_email is provided and the token owner is a teacher, 
        it attempts to fetch that specific student's grade.
        """
        # include[] must be passed exactly as Canvas expects
        params = {"enrollment_state": "active", "include[]": "total_scores"}
        courses = await self._get("courses", params=params)
        
        grades_data = {}
        for c in courses:
            name = c.get("name") or c.get("course_code")
            course_id = c.get("id")
            enrollments = c.get("enrollments", [])
            
            # Default
            grades_data[name] = {"grade": "N/A", "score": "N/A"}
            
            is_teacher = False
            
            for e in enrollments:
                # 1. Student Logic (Real Grade for SELF)
                if e.get("type") == "student" or e.get("role") == "StudentEnrollment":
                    grade = e.get("computed_current_grade")
                    score = e.get("computed_current_score")
                    grades_data[name] = {"grade": grade or "N/A", "score": score if score is not None else "N/A"}
                    break 
                
                # 2. Flag as Teacher
                if e.get("type") == "teacher" or e.get("role") == "TeacherEnrollment":
                    is_teacher = True

            # 3. Teacher Override: Fetch User's grade explicitly
            # If we are a teacher, we want to see the grade for the specific App User
            if is_teacher and list(grades_data[name].values()) == ["N/A", "N/A"] and target_student_email:
                student_grade = await self.get_student_grade(course_id, target_student_email)
                if student_grade:
                     grades_data[name] = {
                         "grade": student_grade.get("grade") or "N/A",
                         "score": student_grade.get("score") if student_grade.get("score") is not None else "N/A"
                     }
        
        return grades_data



    async def get_course_modules(self, course_id: int) -> List[Dict[str, Any]]:
        """Fetch modules for a specific course."""
        return await self._get(f"courses/{course_id}/modules", params={"include[]": "items"})

    def generate_ai_suggestion(self, course_name: str, grade: str) -> str:
        """
        Simulates an AI Agent analyzing the course and grade to provide a targeted suggestion.
        """
        subject = course_name.lower()
        grade_val = grade.upper().strip()
        
        # 1. Determine Grade Tier
        is_failing = grade_val in ["F", "D", "D-", "D+"] or (grade_val.endswith("%") and float(grade_val.strip('%')) < 60)
        is_struggling = grade_val in ["C", "C-", "C+"]
        is_exceling = grade_val in ["A", "A-", "A+", "B+"]

        if grade_val == "N/A":
            return "No grades yet. Review the syllabus to prepare for upcoming assignments."

        # 2. Subject-Specific Context
        resource = "the Tutoring Center"
        if "math" in subject or "calc" in subject:
             resource = "the Math Lab"
        elif "chem" in subject or "bio" in subject or "phys" in subject:
             resource = "Science Study Groups"
        elif "history" in subject or "eng" in subject or "lit" in subject:
             resource = "the Writing Center"

        # 3. Construct Suggestion
        if is_failing:
            return f"Critical Alert: Your grade is at risk. Please visit {resource} immediately and schedule a meeting with your professor."
        elif is_struggling:
            return f"You're passing, but there's room for improvement. Focus on reviewing quiz feedback and consider visiting {resource}."
        elif is_exceling:
             return f"Excellent work! You have a solid command of this material. Consider helping peers or asking your professor for advanced reading."
        else:
             return f"Keep steady. Make sure to check the calendar for the next big assignment."

    async def sync_to_db(self, user_id: int, db_session):
        """
        Synchronizes Canvas course data into the local database (PostgreSQL/SQLite).
        This updates the 'Course' table in our app.
        """
        from app.models import Course, User
        from sqlmodel import select
        import logging

        logger = logging.getLogger("uvicorn")
        logger.info(f"Starting Canvas Sync for user_id={user_id}...")
        
        # Get user to match email
        user = db_session.get(User, user_id)
        if not user:
            logger.error(f"User {user_id} not found during sync.")
            return 0

        courses_data = await self.get_courses()
        synced_count = 0

        # Fetch grades to sync as well, passing user email for lookup
        grades_map = await self.get_course_grades(target_student_email=user.email)

        for c_data in courses_data:
            # Skip courses without a name or code (some API responses are sparse)
            name = c_data.get("name") or c_data.get("original_name")
            code = c_data.get("course_code") or str(c_data.get("id"))
            
            if not name:
                continue

            # Check if course exists
            statement = select(Course).where(Course.user_id == user_id, Course.code == code)
            existing = db_session.exec(statement).first()

            # Determine grade from fetched map
            course_grade_info = grades_map.get(name, {})
            current_grade = course_grade_info.get("grade", "N/A")
            
            # If API gives no letter grade but gives a score, map it manually
            # This fixes the issue where "0.0%" shows instead of "F"
            if current_grade == "N/A" and course_grade_info.get("score") != "N/A":
                try:
                    score_val = float(course_grade_info.get("score"))
                    if score_val >= 97: current_grade = "A+"
                    elif score_val >= 93: current_grade = "A"
                    elif score_val >= 90: current_grade = "A-"
                    elif score_val >= 87: current_grade = "B+"
                    elif score_val >= 83: current_grade = "B"
                    elif score_val >= 80: current_grade = "B-"
                    elif score_val >= 77: current_grade = "C+"
                    elif score_val >= 73: current_grade = "C"
                    elif score_val >= 70: current_grade = "C-"
                    elif score_val >= 67: current_grade = "D+"
                    elif score_val >= 63: current_grade = "D"
                    elif score_val >= 60: current_grade = "D-"
                    else: current_grade = "F"
                except (ValueError, TypeError):
                    # Fallback if score isn't a valid number
                    current_grade = f"{course_grade_info.get('score')}%"

            # Generate AI Suggestion based on performance
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
                # Update details if changed
                changed = False
                if existing.name != name:
                    existing.name = name
                    changed = True
                if existing.grade != str(current_grade):
                    existing.grade = str(current_grade)
                    changed = True
                if existing.suggestion != suggestion:
                    existing.suggestion = suggestion
                    changed = True
                
                if changed:
                    db_session.add(existing)
                    synced_count += 1

        # --- Holistic Student Analysis ---
        # Analyze the collected data for the User Profile
        failing_courses = []
        exceling_courses = []
        total_gpa_points = 0
        total_credits = 0
        
        # We need to query the fresh data from DB or store it in memory during loop
        # Let's simple query the final state
        current_courses = db_session.exec(select(Course).where(Course.user_id == user_id)).all()
        
        for c in current_courses:
            g = c.grade
            if g in ["F", "D", "D-", "D+"] or (g.endswith("%") and float(g.strip('%')) < 60):
                failing_courses.append(c.name)
            elif g in ["A", "A-", "A+"]:
                exceling_courses.append(c.name)

        # Generate Insight
        insight = "You are maintaining a steady performance. Keep up the good work."
        if failing_courses:
            insight = f"URGENT: You are currently failing {', '.join(failing_courses)}. " \
                      "We highly recommend booking a Tutor immediately for these subjects."
        elif len(exceling_courses) == len(current_courses) and len(current_courses) > 0:
            insight = "Outstanding performance! You are excelling in all your classes. " \
                      "Consider applying for the Honors Program."
        elif exceling_courses and failing_courses:
            insight = f"Mixed results: You are doing great in {exceling_courses[0]}, but " \
                      f"{failing_courses[0]} needs immediate attention."
                      
        # Update User
        if user:
            user.ai_insight = insight
            db_session.add(user)

        db_session.commit()
        return synced_count

    def _get_mock_data(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """Provides mock data for development when no API key is present."""
        if "courses" in endpoint and "assignments" not in endpoint:
            # Check for specific course ID in endpoint (e.g. courses/13694560)
            parts = endpoint.split('/')
            if len(parts) > 1 and parts[1].isdigit():
                course_id = int(parts[1])
                return {"id": course_id, "name": f"Mock Course {course_id}", "course_code": f"MC{course_id}"}
            
            return [
                {"id": 101, "name": "Advanced Mathematics", "course_code": "MTH401"},
                {"id": 102, "name": "Organic Chemistry", "course_code": "CHM302"},
                {"id": 103, "name": "World History", "course_code": "HIS101"},
            ]
        elif "assignments" in endpoint:
            return [
                {"id": 1, "name": "Chapter 1 Quiz", "due_at": datetime.now().isoformat(), "points_possible": 100},
                {"id": 2, "name": "Lab Report", "due_at": datetime.now().isoformat(), "points_possible": 50},
            ]
        elif "planner/items" in endpoint:
            return [
                {"plannable_id": 1, "plannable_type": "assignment", "plannable": {"title": "Math Homework"}, "submissions": {"excused": False}},
                {"plannable_id": 2, "plannable_type": "calendar_event", "plannable": {"title": "Study Group"}},
            ]
        return []
