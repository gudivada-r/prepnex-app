from sqlmodel import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///database.db")
if "postgresql" in DATABASE_URL:
    clean_url = DATABASE_URL.split("?")[0]
    engine = create_engine(clean_url, connect_args={"sslmode": "require"})
else:
    engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Migrating User table to add is_admin column...")
    try:
        # Check if column exists strictly for SQLite or Postgres
        if "sqlite" in DATABASE_URL:
            # SQLite does not support IF NOT EXISTS in ADD COLUMN standardly in all versions, 
            # but modern ones do. Safer to just try and catch.
            conn.execute(text("ALTER TABLE user ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
        else:
            conn.execute(text("ALTER TABLE \"user\" ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
        
        conn.commit()
        print("Success: Added is_admin column.")
    except Exception as e:
        print(f"Migration Note: {e} (Column potentially already exists)")
