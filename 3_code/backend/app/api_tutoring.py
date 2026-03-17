from fastapi import APIRouter, Depends, HTTPException, status, Request, File, Form, UploadFile, BackgroundTasks
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime, timedelta
import os
import json

from app.auth import get_session, get_read_session, get_current_user
from app.cache import cache
from app.models import User, TutoringCourse, TutoringSection, TutoringEnrollment, TutoringAppointment

router = APIRouter()

# --- Mock LMS Logic ---
def send_appointment_email(student_email: str, course_name: str, time: str):
    """Mock Email Sender"""
    # In production, use SendGrid/SES
    print(f"DTO [Email Service]: Sending confirmation to {student_email} for {course_name} at {time}")
    return True

@router.post("/tutoring/sync-roster")
async def sync_class_roster(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Simulates an LTI Roster Sync with the LMS (Canvas/Blackboard).
    In a real app, this would use the LTI 1.3 Token to fetch actual enrollments.
    Here, we mock it by auto-enrolling the student in a demo set of courses.
    """
    print(f"DEBUG: Syncing roster for {current_user.email}")
    
    # 1. Mock Data from "LMS"
    mock_lms_courses = [
        {"code": "CS101", "name": "Intro to Computer Science", "term": "Spring 2026", "role": "student"},
        {"code": "MATH201", "name": "Calculus II", "term": "Spring 2026", "role": "student"},
        {"code": "ENG102", "name": "Academic Writing", "term": "Spring 2026", "role": "student"}
    ]
    
    synced_count = 0
    
    for lms_course in mock_lms_courses:
        # A. Upsert Course
        course = session.exec(select(TutoringCourse).where(TutoringCourse.code == lms_course["code"])).first()
        if not course:
            course = TutoringCourse(
                code=lms_course["code"], 
                name=lms_course["name"], 
                department=lms_course["name"].split(' ')[0] # Rough logic
            )
            session.add(course)
            session.commit()
            session.refresh(course)
            
        # B. Upsert Section
        section = session.exec(select(TutoringSection).where(
            TutoringSection.course_id == course.id,
            TutoringSection.term == lms_course["term"]
        )).first()
        
        if not section:
            # Assign first available faculty
            faculty = session.exec(select(User).where(User.is_faculty == True)).first()
            instructor_id = faculty.id if faculty else 1 
            
            section = TutoringSection(
                course_id=course.id, 
                term=lms_course["term"],
                instructor_id=instructor_id
            )
            session.add(section)
            session.commit()
            session.refresh(section)
            
        # C. Upsert Enrollment
        enrollment = session.exec(select(TutoringEnrollment).where(
            TutoringEnrollment.user_id == current_user.id,
            TutoringEnrollment.section_id == section.id
        )).first()
        
        if not enrollment:
            enrollment = TutoringEnrollment(
                user_id=current_user.id,
                section_id=section.id,
                role=lms_course["role"]
            )
            session.add(enrollment)
            synced_count += 1
            
    session.commit()
    
    # Invalidate Cache so the user sees new courses immediately
    cache.delete(f"roster:{current_user.id}")
    
    return {"message": "Roster synced successfully", "new_enrollments": synced_count}

@router.get("/tutoring/my-courses")
async def get_my_tutoring_courses(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Returns the list of courses the student is ACTUALLY enrolled in (Roster Truth)."""
    # 1. Check Cache
    cache_key = f"roster:{current_user.id}"
    cached_courses = cache.get(cache_key)
    if cached_courses:
        return cached_courses

    # 2. Query DB (Miss)
    statement = (
        select(TutoringEnrollment, TutoringSection, TutoringCourse)
        .join(TutoringSection, TutoringEnrollment.section_id == TutoringSection.id)
        .join(TutoringCourse, TutoringSection.course_id == TutoringCourse.id)
        .where(TutoringEnrollment.user_id == current_user.id)
    )
    results = session.exec(statement).all()
    
    courses = []
    for enroll, section, course in results:
        courses.append({
            "enrollment_id": enroll.id,
            "course_name": course.name,
            "course_code": course.code,
            "section_id": section.id,
            "term": section.term,
            "role": enroll.role
        })
    
    # 3. Set Cache (Ex: 1 hour)
    cache.set(cache_key, courses, expire_seconds=3600)
        
    return courses

# --- Phase 3 Logic Agents ---

def get_best_available_tutor(session: Session, section_id: int, start_time: datetime) -> int:
    """
    Reviewer: Implements the 'Round Robin' Load Balancing Logic (Phase 3).
    Strategy:
    1. Find all users enrolled as 'ta' in this section.
    2. If none, fallback to 'instructor_id'.
    3. If TAs exist, find the one with the fewest active appointments.
    """
    # 1. Find TAs
    ta_enrollments = session.exec(
        select(TutoringEnrollment)
        .where(TutoringEnrollment.section_id == section_id)
        .where(TutoringEnrollment.role == "ta")
    ).all()
    
    ta_ids = [e.user_id for e in ta_enrollments]
    
    if not ta_ids:
        # Fallback to instructor
        section = session.get(TutoringSection, section_id)
        return section.instructor_id
    
    # 2. Load Balance (Round Robin)
    # Count appointments for each TA
    # This is a naive implementation; production would check time conflicts too.
    best_ta = None
    min_load = float('inf')
    
    for ta_id in ta_ids:
        count = session.exec(
            select(func.count(TutoringAppointment.id))
            .where(TutoringAppointment.tutor_id == ta_id)
            .where(TutoringAppointment.status == "scheduled")
        ).one()
        
        if count < min_load:
            min_load = count
            best_ta = ta_id
            
    return best_ta if best_ta else ta_ids[0]

def analyze_problem_with_ai(note: str, image_path: Optional[str] = None) -> str:
    """
    Uses Gemini to summarize the student's problem for the tutor.
    """
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return "AI Analysis Unavailable (No API Key)"
        
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Act as a Teaching Assistant Supervisor.
        Summarize the following student problem into a concise 1-sentence 'Brief' for the Teaching Assistant.
        The brief should start with 'Student is struggling with...' and identify the core technical concept.
        
        Student Note: "{note}"
        """
        
        response = model.generate_content(prompt)
        brief = response.text.strip()
        # Ensure it's not too long
        if len(brief) > 150:
            brief = brief[:147] + "..."
        return brief
    except Exception as e:
        print(f"AI Summary Failed: {e}")
        return "AI Analysis Failed"

@router.post("/tutoring/book-appointment")
async def book_tutoring_slot(
    background_tasks: BackgroundTasks,
    section_id: int = Form(...),
    start_time: str = Form(...), # ISO Format
    triage_note: str = Form(...),
    triage_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Phase 3 Booking Flow (Enhanced):
    1. Verify Enrollment (Closed-Loop)
    2. Handle Image Upload
    3. **AI Analysis** (Generate Brief)
    4. **Round Robin Assignment** (Find Best TA)
    5. Create Appointment
    6. Trigger Email Notification
    """
    # 1. Verify Enrollment
    enrollment = session.exec(select(TutoringEnrollment).where(
        TutoringEnrollment.user_id == current_user.id,
        TutoringEnrollment.section_id == section_id
    )).first()
    
    if not enrollment:
        raise HTTPException(status_code=403, detail="You are not enrolled in this course section. Roster Truth enforcement.")

    # 2. Handle Image
    image_url = None
    if triage_image:
        image_url = f"https://mock-storage.com/{triage_image.filename}"
        
    start_dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
    end_dt = start_dt + timedelta(minutes=30)
    
    # 3. AI Analysis (Phase 3 Feature)
    ai_summary = analyze_problem_with_ai(triage_note)
    
    # 4. Round Robin Assignment (Phase 3 Feature)
    best_tutor_id = get_best_available_tutor(session, section_id, start_dt)
    
    # Fallback safety
    if not best_tutor_id:
        # Fallback to current user just to save the record if DB is empty of Faculty
        best_tutor_id = current_user.id 
            
    appointment = TutoringAppointment(
        student_id=current_user.id,
        tutor_id=best_tutor_id,
        section_id=section_id,
        start_time=start_dt,
        end_time=end_dt,
        status="scheduled",
        triage_note=triage_note,
        triage_image_url=image_url,
        ai_summary=ai_summary # Persist the AI brief
    )
    
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    
    # 5. Email Notification
    section = session.get(TutoringSection, section_id)
    course = session.get(TutoringCourse, section.course_id)
    background_tasks.add_task(
        send_appointment_email, 
        current_user.email, 
        course.name, 
        start_time
    )
    
    return {
        "appointment_id": appointment.id,
        "status": "scheduled",
        "assigned_tutor_id": best_tutor_id,
        "ai_brief": ai_summary,
        "message": "Appointment booked successfully. TA assigned."
    }

@router.get("/tutoring/analytics/dashboard")
async def get_dean_analytics(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_read_session)
):
    """
    Phase 3: Dean's Analytics Dashboard
    Returns aggregated demand data.
    """
    # 1. Demand by Course
    # SQLModel doesn't support complex group_by easily without SQLAlchemy core
    # We'll do a simple raw query or list comprehension for MVP
    
    appointments = session.exec(select(TutoringAppointment)).all()
    
    course_demand = {}
    for app in appointments:
        # Naive N+1 but acceptable for MVP Scale (<100 records)
        section = session.get(TutoringSection, app.section_id)
        if section:
            course = session.get(TutoringCourse, section.course_id)
            name = course.name if course else "Unknown"
            course_demand[name] = course_demand.get(name, 0) + 1
            
    # 2. Recent Issues (AI Summaries)
    recent_issues = [
        {"course": session.get(TutoringCourse, session.get(TutoringSection, a.section_id).course_id).code, "issue": a.ai_summary}
        for a in appointments[-5:] if a.ai_summary
    ]
    
    return {
        "total_sessions": len(appointments),
        "demand_by_course": course_demand,
        "recent_intelligence": recent_issues
    }
