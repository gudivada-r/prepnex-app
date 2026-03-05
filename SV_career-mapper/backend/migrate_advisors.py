from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship, Session, create_engine, select
import os
from dotenv import load_dotenv

# We need to add Advisor to models.py first!
from app.models import Tutor, Advisor 

# ... (We will use this script to create the table and seed data)
def migrate_advisors_and_tutors():
    
    # 1. Update Models (import logic is tricky in script, better to ensure models.py is updated first from separate tool call if needed, 
    #    but here I will assume models.py is updated or I will define classes inline for the migration script to work)
    #    Actually, best practice is to ensure models.py has the class, then import it.
    
    from app.models import Tutor, Advisor # We need to add Advisor to models.py first!

    # DB Connection
    import os
    from dotenv import load_dotenv
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    engine = create_engine(database_url)

    # Create Tables
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # Check if we need to seed Tutors
        existing_tutors = session.exec(select(Tutor)).all()
        if not existing_tutors:
            print("Seeding Tutors...")
            tutors = [
                 Tutor(name="Sarah Jenkins", subjects="Calculus, Linear Algebra", rating=4.9, reviews=124, image="S", color="#4f46e5"),
                 Tutor(name="David Chen", subjects="Chemistry, Biology", rating=4.8, reviews=89, image="D", color="#10b981"),
                 Tutor(name="Maya Patel", subjects="Economics, Statistics", rating=5.0, reviews=56, image="M", color="#f59e0b"),
                 Tutor(name="James Wilson", subjects="Physics, Engineering", rating=4.7, reviews=42, image="J", color="#ef4444"),
                 Tutor(name="Emily Davis", subjects="English, History", rating=4.9, reviews=78, image="E", color="#ec4899"),
            ]
            for t in tutors:
                session.add(t)
        
        # Check if we need to seed Advisors
        existing_advisors = session.exec(select(Advisor)).all()
        if not existing_advisors:
             print("Seeding Advisors...")
             advisors = [
                 Advisor(name="Dr. Emily Carter", specialty="Academic Planning", availability="Mon-Thu, 10am-3pm", email="e.carter@uni.edu"),
                 Advisor(name="Mr. Mark Thompson", specialty="Career Counseling", availability="Tue-Fri, 9am-4pm", email="m.thompson@uni.edu"),
                 Advisor(name="Ms. Angela Rodriguez", specialty="Transfer Credits", availability="Mon, Wed, Fri 1pm-5pm", email="a.rodriguez@uni.edu"),
             ]
             for a in advisors:
                 session.add(a)

        session.commit()
        print("Migration and Seeding Complete.")

if __name__ == "__main__":
    migrate_advisors_and_tutors()
