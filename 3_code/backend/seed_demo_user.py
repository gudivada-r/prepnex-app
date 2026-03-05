from sqlmodel import Session, select
from app.auth import engine, get_password_hash
from app.models import User

def seed_demo_user():
    """
    Creates or resets the demo student account required for App Store Review.
    """
    with Session(engine) as session:
        email = "student@university.edu"
        password = "student123"
        full_name = "Demo Student"

        print(f"Checking for user {email}...")
        try:
            user = session.exec(select(User).where(User.email == email)).first()
            if user:
                print(f"User {email} exists. Resetting password...")
                user.password_hash = get_password_hash(password)
                user.is_active = True
                # Ensure fields are set adequately for demo
                if user.gpa is None: user.gpa = 3.5
                if not user.full_name: user.full_name = full_name
                
                session.add(user)
                session.commit()
                print(f"User {email} password reset to '{password}'.")
            else:
                print(f"Creating new user {email}...")
                user = User(
                    email=email,
                    password_hash=get_password_hash(password),
                    full_name=full_name,
                    major="Computer Science", 
                    is_active=True,
                    gpa=3.5,
                    on_track_score=85
                )
                session.add(user)
                session.commit()
                print(f"User {email} created with password '{password}'.")
                
        except Exception as e:
            print(f"Error seeding demo user: {e}")

if __name__ == "__main__":
    seed_demo_user()
