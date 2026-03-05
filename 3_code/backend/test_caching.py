import os
import sys
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Force Test DB
test_db_path = "./backend/test_caching.db"
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

if "DATABASE_URL" in os.environ:
    del os.environ["DATABASE_URL"]
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

if os.path.exists(test_db_path):
    os.remove(test_db_path)

from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
# Import auth explicitly to patch it
import app.auth as auth_module
from app.main import app
from app.cache import cache # The singleton instance we want to verify

# Create Test Engine
test_engine = create_engine(f"sqlite:///{test_db_path}", connect_args={"check_same_thread": False})
SQLModel.metadata.create_all(test_engine)

# PATCH THE ENGINE
print(f"DEBUG: Patching app.auth.engine to use {test_db_path}")
auth_module.engine = test_engine

def test_cache_logic():
    with TestClient(app) as client:
        print(">>> Starting Caching Strategy Test")
        
        # 1. Login
        print("\n[1/4] Login...")
        login_payload = {"username": "student@university.edu", "password": "student123"}
        res = client.post("/api/auth/login", data=login_payload)
        assert res.status_code == 200, f"Login failed: {res.text}"
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get User ID for cache key construction
        # We can decode token or just hit an endpoint, but we know the seed is ID 1 usually
        # Let's rely on checking the cache keys that appear.
        
        # 2. Sync Roster (Should Invalidate/Clear Cache)
        print("\n[2/4] Sync Roster (Initial)...")
        res = client.post("/api/tutoring/sync-roster", headers=headers)
        assert res.status_code == 200
        
        # Verify Cache is empty for this user (or we manually cleared it in sync)
        # We can't easily query the user ID without decoding token here, but let's see.
        # Actually, let's just proceed to Load and Check.
        
        # 3. Load Courses (Cache Miss -> DB -> Cache Set)
        print("\n[3/4] Fetch Courses (Cache Miss)...")
        res = client.get("/api/tutoring/my-courses", headers=headers)
        first_load_courses = res.json()
        print(f"   -> Loaded {len(first_load_courses)} courses.")
        
        # VERIFY CACHE WRITE
        # Inspect the local cache dict
        print(f"   -> Current Cache Keys: {list(cache._local_cache.keys())}")
        cache_keys = list(cache._local_cache.keys())
        assert len(cache_keys) > 0, "Cache should have an entry after fetching courses!"
        user_cache_key = cache_keys[0] # Likely roster:X
        print(f"   -> Verifying Key: {user_cache_key}")
        
        cached_data = cache._local_cache[user_cache_key]
        assert len(cached_data) == len(first_load_courses)
        print("   -> Cache HIT verified in memory.")
        
        # 4. Poison the Cache to prove we are reading from it
        print("\n[4/4] Poisoning Cache to Verify Read...")
        fake_data = [{"course_code": "FAKE101", "course_name": "Cached Course", "section_id": 999, "term": "Fall 2099", "role": "student", "enrollment_id": 999}]
        cache._local_cache[user_cache_key] = fake_data
        
        # Fetch again
        res = client.get("/api/tutoring/my-courses", headers=headers)
        second_load = res.json()
        print(f"   -> Second Load Results: {second_load[0]['course_code']}")
        
        assert second_load[0]['course_code'] == "FAKE101", "API did not return cached data!"
        print("   -> SUCCESS: API served cached data.")
        
        # 5. Sync Roster Again (Should Invalidate)
        print("\n[5/5] Sync Roster (Cache Invalidation)...")
        client.post("/api/tutoring/sync-roster", headers=headers)
        
        # Check cache is gone
        assert  user_cache_key not in cache._local_cache, "Cache key should be deleted after sync!"
        print("   -> SUCCESS: Cache invalidated after sync.")
        
        # Verify next load gives real data
        res = client.get("/api/tutoring/my-courses", headers=headers)
        third_load = res.json()
        assert third_load[0]['course_code'] != "FAKE101"
        print("   -> SUCCESS: Fresh data loaded from DB.")

if __name__ == "__main__":
    try:
        test_cache_logic()
    except Exception as e:
        print(f"\n!!! TEST FAILED: {str(e)}")
        # import traceback
        # traceback.print_exc()
