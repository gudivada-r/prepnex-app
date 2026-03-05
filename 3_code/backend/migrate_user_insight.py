from sqlmodel import Session, text
from app.auth import engine

def migrate():
    with Session(engine) as session:
        print("Running migration to add 'ai_insight' column to 'user' table...")
        try:
            # PostgreSQL syntax (assuming table name is 'user' which is reserved in some SQL, but SQLModel usually lowercases class name)
            # In SQLModel/Postgres, "User" usually becomes "user". Quote it to be safe if needed, 
            # but usually SQLAlchemy handles it. Let's try standard alter.
            session.exec(text('ALTER TABLE "user" ADD COLUMN ai_insight VARCHAR;'))
            session.commit()
            print("Migration successful: Added 'ai_insight' column.")
        except Exception as e:
            print(f"Migration failed (Column might already exist or table name issue): {e}")

if __name__ == "__main__":
    migrate()
