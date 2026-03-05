from app.auth import engine
from sqlalchemy import text, inspect

def migrate_column():
    print("Checking for 'is_faculty' column...")
    inspector = inspect(engine)
    existing_columns = [c["name"] for c in inspector.get_columns("user")]
    
    if "is_faculty" not in existing_columns:
        print("Column 'is_faculty' missing. Adding it...")
        with engine.connect() as conn:
            try:
                # Use standard SQL. For SQLite it's BOOLEAN or INTEGER. For Postgres it's BOOLEAN.
                # SQLModel uses BOOLEAN which maps correctly.
                conn.execute(text('ALTER TABLE "user" ADD COLUMN is_faculty BOOLEAN DEFAULT FALSE')) 
                conn.commit()
                print("Successfully added column 'is_faculty'.")
            except Exception as e:
                print(f"Error adding column: {e}")
    else:
        print("Column 'is_faculty' already exists.")

if __name__ == "__main__":
    migrate_column()
