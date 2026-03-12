import asyncio
import time
import os
import shutil
import sys
import json
from playwright.async_api import async_playwright

DURATIONS = {
    "01_Hook_EdNex": 60.55,
    "02_Aura_Tiers": 47.33,
    "03_SignIn": 21.14,
    "04_Dashboard": 48.24,
    "05_GetAuraChat": 37.87,
    "06_Courses": 32.90,
    "07_Tutoring": 34.87,
    "08_Wellness": 25.51,
    "09_Holds": 22.37,
    "10_FinancialAid": 30.72,
    "11_SocialCampus": 22.58,
    "12_AdminPanel": 32.88,
    "13_TCO": 41.90,
    "14_Closing": 23.14,
}

BASE_URL   = "https://aumtech.ai"
DEMO_DIR   = os.path.dirname(os.path.abspath(__file__))
VIDEO_OUT  = os.path.join(DEMO_DIR, "recorded_browser.webm")
TIMINGS_OUT = os.path.join(DEMO_DIR, "timings.json")

# Intro Slides
INTRO_SLIDES_URL = r"file:///c:/Projects/AA/at/3_code/demo/intro_slides.html"

REC_WIDTH  = 1920
REC_HEIGHT = 1080

scene_timings = {}

def log_scene(name, start_time):
    print(f"\n[SCENE START] {name} at {start_time:.2f}s", flush=True)
    scene_timings[name] = start_time

async def wait(page, seconds, label=""):
    if label:
        print(f"  -> {label} ({seconds:.1f}s)", flush=True)
    await page.wait_for_timeout(int(seconds * 1000))

async def heartbeat(page):
    await page.evaluate("""() => {
        const d = document.createElement('div');
        d.id = 'hb';
        d.style.cssText = 'position:fixed;bottom:0;right:0;width:1px;height:1px;z-index:99999;';
        document.body.appendChild(d);
        let f = 0;
        (function tick() { d.style.opacity = (f++ % 2) ? '0.99' : '1'; requestAnimationFrame(tick); })();
    }""")

async def safe_click(page, selector, timeout=15000):
    try:
        print(f"  [CLICK] Waiting for {selector}...")
        await page.wait_for_selector(selector, timeout=timeout, state="visible")
        await page.click(selector, force=True)
        return True
    except Exception as e:
        print(f"  [WARN] Click failed on {selector}: {e}")
        return False

async def safe_fill(page, selector, text, delay=60, timeout=15000):
    try:
        await page.wait_for_selector(selector, timeout=timeout, state="visible")
        await page.click(selector)
        await page.fill(selector, "") 
        await page.type(selector, text, delay=delay)
        return True
    except Exception as e:
        print(f"  [WARN] Fill failed on {selector}: {e}")
        return False

async def slow_scroll(page, target_y):
    await page.evaluate(f"window.scrollTo({{ top: {target_y}, behavior: 'smooth' }});")
    await page.wait_for_timeout(2000)

async def highlight_element(page, selector):
    try:
        await page.evaluate(f"""(sel) => {{
            const el = document.querySelector(sel);
            if (!el) return;
            el.style.transition = 'box-shadow 0.4s';
            el.style.boxShadow = '0 0 0 6px rgba(124,109,250,0.7)';
            setTimeout(() => {{ el.style.boxShadow = ''; }}, 3500);
        }}""", selector)
    except: pass

async def record_demo():
    print("[START] aumtech.ai Professional Demo Recorder", flush=True)
    start_wall_time = time.time()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, args=["--start-maximized"])
        context = await browser.new_context(
            record_video_dir=DEMO_DIR,
            record_video_size={"width": REC_WIDTH, "height": REC_HEIGHT},
            viewport={"width": REC_WIDTH, "height": REC_HEIGHT},
        )
        page = await context.new_page()

        # 01 Hook - Slides 1 & 2
        await page.goto(INTRO_SLIDES_URL)
        await page.wait_for_selector("#slide1", state="visible")
        log_scene("01_Hook_EdNex", time.time() - start_wall_time)
        await heartbeat(page)
        mid = DURATIONS["01_Hook_EdNex"] / 2
        await wait(page, mid, "Slide 1")
        await page.evaluate("window.goToSlide(1)") 
        await wait(page, DURATIONS["01_Hook_EdNex"] - mid, "Slide 2")
        
        # 02 Tiers - Slides 3 & 4
        log_scene("02_Aura_Tiers", time.time() - start_wall_time)
        await page.evaluate("window.goToSlide(2)") 
        mid2 = DURATIONS["02_Aura_Tiers"] / 2
        await wait(page, mid2, "Slide 3")
        await page.evaluate("window.goToSlide(3)") 
        await wait(page, DURATIONS["02_Aura_Tiers"] - mid2, "Slide 4")
        
        # 03 SignIn
        await page.goto(f"{BASE_URL}/login")
        await page.wait_for_selector("input[type='email']", timeout=20000)
        log_scene("03_SignIn", time.time() - start_wall_time)
        await heartbeat(page)
        await safe_fill(page, "input[type='email']", "daniel.garrett12@txu.edu")
        await wait(page, 1)
        await safe_fill(page, "input[type='password']", "password123")
        await wait(page, 1)
        await highlight_element(page, "button[type='submit']")
        await wait(page, 1)
        await safe_click(page, "button[type='submit']")
        
        # 04 Dashboard
        print("  Waiting for dashboard navigation...")
        try:
            await page.wait_for_selector(".on-track-card, [class*='score'], .sidebar", timeout=30000)
        except:
            print("  [WARN] Dashboard elements didn't appear, attempting to continue...")
        
        log_scene("04_Dashboard", time.time() - start_wall_time)
        await heartbeat(page)
        await wait(page, 5)
        await slow_scroll(page, 500)
        await wait(page, 5)
        await slow_scroll(page, 0)
        await wait(page, DURATIONS["04_Dashboard"] - 12, "Reviewing metrics")
        
        # 05 GetAura Chat
        await safe_click(page, "text=Get Aura")
        try:
            await page.wait_for_selector("textarea, [placeholder*='message']", timeout=30000)
        except:
            print("  [WARN] Chat area didn't appear")
            
        log_scene("05_GetAuraChat", time.time() - start_wall_time)
        await safe_fill(page, "textarea, [placeholder*='message']", "I failed my Calculus midterm and I think I'm losing my scholarship.")
        await page.keyboard.press("Enter")
        await wait(page, DURATIONS["05_GetAuraChat"], "Chat session")

        # 06 Courses
        await safe_click(page, "text=Courses")
        try:
            await page.wait_for_selector("text=Degree Roadmap", timeout=20000)
        except: pass
        log_scene("06_Courses", time.time() - start_wall_time)
        await wait(page, 5)
        await safe_click(page, "text=Degree Roadmap")
        await wait(page, DURATIONS["06_Courses"] - 5, "Degree Roadmap")

        # 07 Tutoring
        await safe_click(page, "text=Tutoring Center")
        try:
            await page.wait_for_selector("button:has-text('Sync')", timeout=20000)
        except: pass
        log_scene("07_Tutoring", time.time() - start_wall_time)
        await wait(page, 4)
        await safe_click(page, "button:has-text('Sync')")
        await wait(page, 5)
        await safe_click(page, ".card-white:first-child, [class*='card']:first-child")
        await wait(page, 2)
        await safe_fill(page, "textarea", "I am struggling with Python lists specifically nested loops.")
        await wait(page, DURATIONS["07_Tutoring"] - 11, "Booking process")
        
        # 08 Wellness
        await safe_click(page, "text=Wellness")
        try:
            await page.wait_for_selector("text=Study Timer", timeout=20000)
        except: pass
        log_scene("08_Wellness", time.time() - start_wall_time)
        await wait(page, 4)
        await safe_click(page, "text=Study Timer")
        await wait(page, DURATIONS["08_Wellness"] - 4, "Wellness timer")

        # 09 Holds
        await safe_click(page, "text=Holds")
        try:
            await page.wait_for_selector(".card-white, [class*='hold']", timeout=20000)
        except: pass
        log_scene("09_Holds", time.time() - start_wall_time)
        await wait(page, 5)
        await highlight_element(page, ".card-white")
        await wait(page, DURATIONS["09_Holds"] - 5, "Holds review")

        # 10 FinancialAid
        await safe_click(page, "text=Financial Nexus")
        try:
            await page.wait_for_selector("text=AI Match", timeout=20000)
        except: pass
        log_scene("10_FinancialAid", time.time() - start_wall_time)
        await wait(page, 5)
        await safe_click(page, "text=AI Match")
        await wait(page, DURATIONS["10_FinancialAid"] - 5, "Scholarship match")

        # 11 Social Campus
        await safe_click(page, "text=Social Campus")
        try:
            await page.wait_for_selector("text=Marketplace", timeout=20000)
        except: pass
        log_scene("11_SocialCampus", time.time() - start_wall_time)
        await wait(page, 5)
        await safe_click(page, "text=Textbook Marketplace")
        await wait(page, DURATIONS["11_SocialCampus"] - 5, "Social Center")

        # 12 Admin Panel
        await safe_click(page, "text=Logout")
        await page.wait_for_selector("input[type='email']", timeout=20000)
        log_scene("12_AdminPanel", time.time() - start_wall_time)
        await safe_fill(page, "input[type='email']", "admin@university.edu")
        await safe_fill(page, "input[type='password']", "admin123")
        await safe_click(page, "button[type='submit']")
        try:
            await page.wait_for_selector("text=Admin Panel", timeout=25000)
        except: pass
        await safe_click(page, "text=Admin Panel")
        await wait(page, DURATIONS["12_AdminPanel"] - 10, "Admin metrics")

        # 13 TCO
        await safe_click(page, "text=Quote Generator")
        try:
            await page.wait_for_selector("text=Aura Vault", timeout=20000)
        except: pass
        log_scene("13_TCO", time.time() - start_wall_time)
        await wait(page, 6)
        await slow_scroll(page, 500)
        await safe_click(page, "text=Aura Vault")
        await wait(page, DURATIONS["13_TCO"] - 11, "TCO analysis")
        
        # 14 Closing
        log_scene("14_Closing", time.time() - start_wall_time)
        await safe_click(page, "text=Dashboard")
        await slow_scroll(page, 0)
        await wait(page, DURATIONS["14_Closing"], "Final summary")

        print("\n[SAVING] Closing browser and saving video...", flush=True)
        raw_video = await page.video.path()
        with open(TIMINGS_OUT, "w") as f:
            json.dump(scene_timings, f, indent=2)
            
        await context.close()
        await browser.close()

        if os.path.exists(VIDEO_OUT): os.remove(VIDEO_OUT)
        shutil.copy(raw_video, VIDEO_OUT)
        print(f"[SAVED] Recording Complete.", flush=True)

if __name__ == "__main__":
    asyncio.run(record_demo())
