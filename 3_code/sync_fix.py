import sys
import re

filepath = r'1_marketing\Demo_3_4\record_demo_v2.py'
with open(filepath, 'r', encoding='utf-8') as f:
    code = f.read()

# Make sure time is imported
if 'import time' not in code:
    code = code.replace('import asyncio\n', 'import asyncio\nimport time\n')

# Define scene timing utility
sync_class = '''
# ── Scene Synchronization ──────────────────────────────────────────────────
class SceneTimer:
    def __init__(self, page, duration):
        self.page = page
        self.duration = float(duration)
        self.start_time = time.time()
        
    async def finish(self, label="wait for audio to finish"):
        elapsed = time.time() - self.start_time
        remaining = self.duration - elapsed
        if remaining > 0:
            log(f"  -> [SYNC] {label} ({remaining:.1f}s remaining of {self.duration}s)")
            await wait(self.page, remaining)
        else:
            log(f"  -> [SYNC WARN] Scene ran {-remaining:.1f}s overtime!")
'''

code = code.replace('async def inject_heartbeat(page):', sync_class + '\nasync def inject_heartbeat(page):')

# Pattern to replace scene start
scene_start_pattern = re.compile(r'scene\(\"([^"]+)\"\)')

def replace_scene_start(match):
    scene_name = match.group(1)
    return f'scene("{scene_name}")\n        timer = SceneTimer(page, DURATIONS["{scene_name}"])'

code = scene_start_pattern.sub(replace_scene_start, code)

# Automatically replace the manual remaining waits at the end of each scene with timer.finish()
# We look for something like: await wait(page, DURATIONS["..."] - X, "...")
wait_pattern = re.compile(r'await wait\(page, DURATIONS\["[^"]+"\] \- [0-9.]+, "([^"]+)"\)')
code = wait_pattern.sub(r'await timer.finish("\1")', code)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(code)

print("Synchronizer modifications applied successfully!")
