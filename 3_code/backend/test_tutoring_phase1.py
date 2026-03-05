import sys
import os
from sqlmodel import Session, SQLModel, create_engine, select
from datetime import datetime, timedelta

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.models import (
    User, 
    TutoringCourse, 
    TutoringSection, 
    TutoringEnrollment, 
    TutoringAppointment
)

# Setup Test DB
# using sqlite file for simplicity in testing environment, or the dev postgres if configured.
# For safety, I'll use a local sqlite file for this specific test isolate from main dev DB if possible,
# strictly to test model integrity.
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///backend/{sqlite_file_name}"
# process.env.DATABASE_URL usually points to postgres, checking if we can reuse the main logic
# Let's try to use the actual app logic for connection if possible, but fallback to local sqlite for safety.

engine = create_engine(sqlite_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def test_phase_1_flow():
    print(">>> Starting Phase 1 Test: Tutoring Core Loop")
    
    # 1. Setup DB
    create_db_and_tables()
    
    with Session(engine) as session:
        # 2. Create Users
        print("\n[1/5] Creating Test Users...")
        # Check if users exist to avoid duplicates if re-running on persistent DB
        faculty = session.exec(select(User).where(User.email == "prof@univ.edu")).first()
        if not faculty:
            faculty = User(
                email="prof@univ.edu", 
                password_hash="mock_hash", 
                full_name="Dr. Smith", 
                is_faculty=True,
                is_active=True
            )
            session.add(faculty)
        
        student = session.exec(select(User).where(User.email == "student_test@univ.edu")).first()
        if not student:
            student = User(
                email="student_test@univ.edu", 
                password_hash="mock_hash", 
                full_name="Jane Doe", 
                is_active=True
            )
            session.add(student)
        
        session.commit()
        session.refresh(faculty)
        session.refresh(student)
        print(f"   -> Faculty ID: {faculty.id}")
        print(f"   -> Student ID: {student.id}")

        # 3. Create Course & Section
        print("\n[2/5] Creating Course & Section...")
        course = session.exec(select(TutoringCourse).where(TutoringCourse.code == "CS101")).first()
        if not course:
            course = TutoringCourse(code="CS101", name="Intro to Computer Science", department="Computer Science")
            session.add(course)
            session.commit()
            session.refresh(course)
        
        section = session.exec(select(TutoringSection).where(TutoringSection.course_id == course.id)).first()
        if not section:
            section = TutoringSection(course_id=course.id, instructor_id=faculty.id, term="Spring 2026")
            session.add(section)
            session.commit()
            session.refresh(section)
        print(f"   -> Course: {course.code} ({course.name})")
        print(f"   -> Section ID: {section.id} (Instructor: {faculty.full_name})")

        # 4. Enroll Student
        print("\n[3/5] Enrolling Student via 'Roster Truth' (Mock)...")
        enrollment = session.exec(select(TutoringEnrollment).where(TutoringEnrollment.user_id == student.id, TutoringEnrollment.section_id == section.id)).first()
        if not enrollment:
            enrollment = TutoringEnrollment(
                user_id=student.id, 
                section_id=section.id, 
                role="student"
            )
            session.add(enrollment)
            session.commit()
        print("   -> Enrollment Confirmed.")

        # 5. Book Appointment
        print("\n[4/5] Student Booking Appointment...")
        start_time = datetime.now() + timedelta(days=1)
        end_time = start_time + timedelta(minutes=30)
        
        appointment = session.exec(select(TutoringAppointment).where(TutoringAppointment.student_id == student.id)).first()
        if not appointment:
            appointment = TutoringAppointment(
                student_id=student.id,
                tutor_id=faculty.id, # In this basic test, Faculty is acting as Tutor
                section_id=section.id,
                start_time=start_time,
                end_time=end_time,
                status="scheduled",
                triage_note="I don't understand Recursion."
            )
            session.add(appointment)
            session.commit()
            session.refresh(appointment)
        print(f"   -> Appointment Booked: ID {appointment.id}")
        print(f"   -> Time: {appointment.start_time}")
        print(f"   -> Triage Note: {appointment.triage_note}")

        # 6. Verify Data Integrity
        print("\n[5/5] Verifying Roster Truth Constraints...")
        # Verify we can link Appointment -> Section -> Course
        ppt = session.get(TutoringAppointment, appointment.id)
        assert ppt.section_id == section.id
        sect = session.get(TutoringSection, ppt.section_id)
        crs = session.get(TutoringCourse, sect.course_id)
        
        print("   -> Integrity Check PASSED: Appointment is correctly linked to " + crs.name)

    print("\n>>> Phase 1 Test Completed Successfully.")

if __name__ == "__main__":
    try:
        test_phase_1_flow()
    except Exception as e:
        print(f"\n!!! TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
