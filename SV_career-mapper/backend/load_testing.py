import asyncio
import os
import sys
import time
import random

# Add current directory to sys.path to resolve app imports
sys.path.append(os.getcwd())

from sqlmodel import Session, select
from app.auth import engine, get_password_hash, verify_password
from app.models import User, Course

TEST_USER_COUNT = 10
BASE_EMAIL = "test_user_{}@student.org"
PASSWORD = "password"

async def ensure_users_exist():
    """Creates test users if they don't exist."""
    print(f"--- Ensuring {TEST_USER_COUNT} test users exist ---")
    created_count = 0
    user_ids = []
    
    with Session(engine) as session:
        for i in range(1, TEST_USER_COUNT + 1):
            email = BASE_EMAIL.format(i)
            user = session.exec(select(User).where(User.email == email)).first()
            
            if not user:
                user = User(
                    email=email,
                    full_name=f"Test User {i}",
                    password_hash=get_password_hash(PASSWORD)
                )
                session.add(user)
                session.commit()
                session.refresh(user)
                created_count += 1
            
            user_ids.append(user.id)
    
    print(f"Created {created_count} new users. Total users ready locally.")
    return user_ids

async def simulate_user_session(user_id: int, session_id: int):
    """
    Simulates a user logging in and loading their dashboard.
    """
    start_time = time.time()
    
    # Simulate network latency/user think time slightly
    await asyncio.sleep(random.uniform(0.1, 0.5))
    
    with Session(engine) as db:
        # 1. Login (CPU intensive crypto)
        user = db.get(User, user_id)
        if not user:
            return f"User {user_id} NOT FOUND"
            
        # Verify password (simulation of calling /token endpoint)
        is_valid = verify_password(PASSWORD, user.password_hash)
        if not is_valid:
            return f"User {user_id} Login FAILED"
        
        # 2. Access Dashboard (DB intensive)
        # Fetch courses
        courses = db.exec(select(Course).where(Course.user_id == user_id)).all()
        
        # Fetch generic data (simulating other dashboard calls)
        # (Just sleeping to simulate processing time of data aggregation)
        await asyncio.sleep(random.uniform(0.05, 0.2))
        
    duration = time.time() - start_time
    return f"User {user.email:<25} | Login: OK | Dashboard Loaded: {len(courses)} courses | Time: {duration:.3f}s"

async def main():
    print(f"--- Starting Load Test for {TEST_USER_COUNT} Concurrent Users ---")
    
    # 1. Setup Data
    user_ids = await ensure_users_exist()
    
    print(f"\n--- Launching {TEST_USER_COUNT} Concurrent Sessions ---")
    start_time = time.time()
    
    # 2. Run Concurrent Tasks
    tasks = [simulate_user_session(uid, idx) for idx, uid in enumerate(user_ids)]
    results = await asyncio.gather(*tasks)
    
    total_time = time.time() - start_time
    
    print("\n--- Load Test Results ---")
    for res in results:
        print(res)
        
    print(f"\nTotal Test Duration: {total_time:.3f}s")
    print(f"Average Time per User: {total_time/TEST_USER_COUNT:.3f}s")
    print("--- Test Complete ---")

if __name__ == "__main__":
    asyncio.run(main())
