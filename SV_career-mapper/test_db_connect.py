import os
import sys

# 1. Setup path first to find the app module
sys.path.append(os.path.join(os.getcwd(), "backend"))

# 2. Set the DATABASE_URL environment variable *before* importing app.auth
#    This ensures that when 'engine' is created at module level, it sees this URL.
os.environ['DATABASE_URL'] = 'postgresql://neondb_owner:npg_BwHSiOr92qQg@ep-divine-pine-a4tex5cw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# 3. Import modules
from sqlmodel import Session, select
from app.auth import engine
from app.models import User

try:
    print('Engine URL:', engine.url)
    
    # 4. Try to connect and query
    with Session(engine) as session:
        # Create tables if they don't exist (optional, but good for verification)
        from sqlmodel import SQLModel
        SQLModel.metadata.create_all(engine)
        
        stmt = select(User)
        results = session.exec(stmt).all()
        print('User count:', len(results))
        
    print('Connection succeeded')
except Exception as e:
    print('Connection failed:', e)
    sys.exit(1)
