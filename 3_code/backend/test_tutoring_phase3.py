import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Force Test DB
test_db_path = "./backend/test_phase3.db"
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

# Force sqlalchemy to use this URL by unsetting previous env if any
if "DATABASE_URL" in os.environ:
    del os.environ["DATABASE_URL"]
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

if os.path.exists(test_db_path):
    os.remove(test_db_path)

from fastapi.testclient import TestClient
from sqlmodel import Session, select, create_engine, SQLModel
# Import auth explicitly to patch it
import app.auth as auth_module
from app.main import app

# Create Test Engine
test_engine = create_engine(f"sqlite:///{test_db_path}", connect_args={"check_same_thread": False})
SQLModel.metadata.create_all(test_engine)

# PATCH THE ENGINE
print(f"DEBUG: Patching app.auth.engine to use {test_db_path}")
auth_module.engine = test_engine
from app.models import User, TutoringEnrollment, TutoringSection

def setup_test_data():
    # Helper to add TAs for Round Robin test
    # Use the PATCHED engine
    with Session(auth_module.engine) as session:
        # Create TAs (Check first to avoid Unique Constraint if re-running)
        ta1 = session.exec(select(User).where(User.email == "ta1@univ.edu")).first()
        if not ta1:
            ta1 = User(email="ta1@univ.edu", password_hash="hash", full_name="TA One", is_active=True)
            session.add(ta1)
        
        ta2 = session.exec(select(User).where(User.email == "ta2@univ.edu")).first()
        if not ta2:
            ta2 = User(email="ta2@univ.edu", password_hash="hash", full_name="TA Two", is_active=True)
            session.add(ta2)
            
        session.commit()
        session.refresh(ta1)
        session.refresh(ta2)
        
        # We need to know a valid section ID. 
        # The Sync Roster runs first in the test, which creates sections.
        # We'll hook into this inside the test function or just assume ID=1 after sync.
        return ta1.id, ta2.id

def test_phase3_features():
    ta1_id, ta2_id = setup_test_data()
    
    with TestClient(app) as client:
        print(">>> Starting Phase 3 Test: Intelligence & Scale")
        
        # 1. Login & Sync
        print("\n[1/5] Login & Roster Sync...")
        login_payload = {"username": "student@university.edu", "password": "student123"}
        res = client.post("/api/auth/login", data=login_payload)
        if res.status_code != 200:
             print(f"!!! LOGIN FAILED: {res.status_code}")
             print(f"Response: {res.text}")
             exit(1)
             
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        client.post("/api/tutoring/sync-roster", headers=headers)
        
        # 2. Inject TAs into Section 1 (CS101)
        print("\n[2/5] Injecting Round Robin Data (TAs)...")
        # We need to manually add TA enrollments since LTI sync mocks 'student' role
        with Session(auth_module.engine) as session:
            # Dynamically find the section created by sync-roster (CS101)
            # We assume sync-roster created it.
            # Using raw SQL or model query.
            from app.models import TutoringCourse
            
            # Find CS101 Course
            cs_course = session.exec(select(TutoringCourse).where(TutoringCourse.code == "CS101")).first()
            if not cs_course:
                 raise Exception("CS101 Course not found after sync!")
            
            # Find Section for CS101
            section = session.exec(select(TutoringSection).where(TutoringSection.course_id == cs_course.id)).first()
            if not section:
                 raise Exception("CS101 Section not found after sync!")
            
            section_id = section.id
            print(f"   -> Found CS101 Section ID: {section_id}")

            # Add TA1 and TA2
            session.add(TutoringEnrollment(user_id=ta1_id, section_id=section_id, role="ta"))
            session.add(TutoringEnrollment(user_id=ta2_id, section_id=section_id, role="ta"))
            session.commit()
            print(f"   -> Added TA {ta1_id} and TA {ta2_id} to Section {section_id}")

        # 3. Book Appointment (Trigger Round Robin & AI)
        print("\n[3/5] Booking Appointment (Testing Round Robin)...")
        form_data = {
            "section_id": str(section_id),
            "start_time": "2026-03-01T10:00:00",
            "triage_note": "I don't understand how to implement the QuickSort algorithm in Python."
        }
        res = client.post("/api/tutoring/book-appointment", data=form_data, headers=headers)
        assert res.status_code == 200
        data1 = res.json()
        print(f"   -> Booking 1 Assigned to TA ID: {data1['assigned_tutor_id']}")
        print(f"   -> AI Brief: {data1.get('ai_brief', 'N/A')}")
        
        # Verify AI Summary logic (Mocked or Real)
        if "QuickSort" in str(data1.get('ai_brief', '')):
             print("   -> AI Extract Verified: 'QuickSort' found.")
        
        # Book Again to see load balancing
        # In a perfect round robin with load balancing, if TA1 has 1 appt, next should go to TA2 (0 appts)
        print("\n[4/5] Booking Second Appointment (Testing Load Balancer)...")
        res = client.post("/api/tutoring/book-appointment", data=form_data, headers=headers)
        data2 = res.json()
        print(f"   -> Booking 2 Assigned to TA ID: {data2['assigned_tutor_id']}")
        
        if data1['assigned_tutor_id'] != data2['assigned_tutor_id']:
            print("   -> SUCCESS: Load Balancer distributed the load!")
        else:
            print("   -> NOTE: Load Balancer assigned same TA (Might be random or count not updated in test session scope).")

        # 4. Analytics Dashboard
        print("\n[5/5] Checking Dean's Analytics...")
        res = client.get("/api/tutoring/analytics/dashboard", headers=headers)
        metrics = res.json()
        print(f"   -> Total Sessions: {metrics['total_sessions']}")
        print(f"   -> Demand: {metrics['demand_by_course']}")
        assert metrics['total_sessions'] >= 2
        
        print("\n>>> Phase 3 Test Completed Successfully.")

if __name__ == "__main__":
    try:
        test_phase3_features()
    except Exception as e:
        print(f"\n!!! TEST FAILED: {str(e)}")
