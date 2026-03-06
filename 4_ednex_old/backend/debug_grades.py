import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.integrations.lms.canvas import CanvasService

async def debug_grades():
    print("--- Debugging Canvas Grades Logic ---")
    
    # Hardcoded credentials as in api.py
    token = "7~3LxQLMnxX4ZRzFteTC97YuyJuPaR92Aef88eLEB3M9YLtmXQ8ezH7TkPXDk4cYVx"
    base_url = "https://canvas.instructure.com/api/v1"
    
    service = CanvasService(base_url=base_url, access_token=token)
    
    try:
        print("Calling get_course_grades()...")
        grades = await service.get_course_grades()
        print("Success!")
        print(grades)
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_grades())
