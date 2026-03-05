from sqlmodel import Session, text
from app.auth import engine

def migrate():
    with Session(engine) as session:
        print("Running migration to add 'suggestion' column to 'course' table...")
        try:
            # PostgreSQL syntax
            session.exec(text("ALTER TABLE course ADD COLUMN suggestion VARCHAR;"))
            session.commit()
            print("Migration successful: Added 'suggestion' column.")
        except Exception as e:
            print(f"Migration failed (Column might already exist): {e}")

if __name__ == "__main__":
    migrate()
