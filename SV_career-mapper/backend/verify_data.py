from sqlmodel import Session, create_engine, select
from app.models import Tutor, Advisor
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()
database_url = os.getenv("DATABASE_URL")
if not database_url:
    # Fallback for local testing if env not set in shell but file exists
    # Assuming standard sqlite url or similar if used previously, but better to rely on load_dotenv
    pass

engine = create_engine(database_url)

def verify_data():
    with Session(engine) as session:
        # Check Tutors
        tutors = session.exec(select(Tutor)).all()
        print(f"--- Tutors Verification ({len(tutors)}) ---")
        for t in tutors:
            print(f"[OK] Tutor: {t.name} | Subject: {t.subjects}")
        
        if len(tutors) == 0:
             print("[FAIL] No tutors found in DB!")

        print("\n")

        # Check Advisors
        advisors = session.exec(select(Advisor)).all()
        print(f"--- Advisors Verification ({len(advisors)}) ---")
        for a in advisors:
            print(f"[OK] Advisor: {a.name} | Specialty: {a.specialty}")

        if len(advisors) == 0:
             print("[FAIL] No advisors found in DB!")

if __name__ == "__main__":
    verify_data()
