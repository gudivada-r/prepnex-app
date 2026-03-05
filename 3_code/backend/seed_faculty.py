from sqlmodel import Session, select
from app.auth import engine, get_password_hash
from app.models import User

def seed_faculty():
    with Session(engine) as session:
        email = "faculty@university.edu"
        print(f"Checking for user {email}...")
        try:
            user = session.exec(select(User).where(User.email == email)).first()
            if user:
                print(f"User {email} already exists. Updating to be faculty.")
                user.is_faculty = True
                session.add(user)
                session.commit()
            else:
                print(f"Creating new faculty user {email}...")
                user = User(
                    email=email,
                    password_hash=get_password_hash("faculty123"),
                    full_name="Dr. Alan Grant",
                    major="N/A", 
                    is_faculty=True
                )
                session.add(user)
                session.commit()
                print("Faculty user created.")
        except Exception as e:
            print(f"Error: {e}")
            # Try to add column if it fails? No, that's handled by main.py migration or should be.

if __name__ == "__main__":
    seed_faculty()
