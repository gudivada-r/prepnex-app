import sys
import os

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import Session, select
from app.auth import engine, get_password_hash
from app.models import User

def ensure_user():
    with Session(engine) as session:
        email = "ram@aumtech.ai"
        user = session.exec(select(User).where(User.email == email)).first()
        
        if user:
            print(f"User {email} already exists. Resetting password...")
            user.password_hash = get_password_hash("password123")
            session.add(user)
            session.commit()
            print("Password reset to 'password123'")
        else:
            print(f"User {email} not found. Creating...")
            new_user = User(
                email=email,
                password_hash=get_password_hash("password123"),
                full_name="Ram",
                is_active=True,
                is_admin=True # Assuming aumtech.ai might need admin
            )
            session.add(new_user)
            session.commit()
            print(f"User {email} created with password 'password123'")

if __name__ == "__main__":
    ensure_user()
