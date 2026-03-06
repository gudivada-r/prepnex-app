"""
Step 2: Record the browser demo synced to narration timing.
Run: python demo/record_demo.py
Output: demo/recorded_browser.webm

Fixes applied:
  - Intro plays 4 animated slides matching voiceover (70s), NOT static login
  - Viewport set to 1660x980 for recording (preserves stat cards on right side)
  - Dashboard stats (GPA/On-track) are fully visible — no clipping
  - Tutoring Center navigates to actual courses (not stuck loading)
  - Holds & Social Campus pages are pre-populated with demo data
  - Every scene synced to voiceover with explicit mouse movements
"""
import asyncio
import time
import os
import shutil
import sys
from playwright.async_api import async_playwright

# ── Exact durations from measured audio files ──
DURATIONS = {
    "01_Intro":       72.55,
    "02_SignIn":      21.96,
    "03_Dashboard":   50.21,
    "04_AINavigator": 62.26,
    "05_Courses":     35.78,
    "06_Tutoring":    62.64,
    "07_Wellness":    30.05,
    "08_Holds":       29.42,
    "09_FinancialAid":39.29,
    "10_SocialCampus":29.06,
    "11_AdminPanel":  45.70,
    "12_Closing":     36.70,
}

# ── Config ──
BASE_URL   = "https://aumtech.ai"   # Live production site
DEMO_DIR   = os.path.dirname(os.path.abspath(__file__))
VIDEO_OUT  = os.path.join(DEMO_DIR, "recorded_browser.webm")
SLIDES_PATH = os.path.join(DEMO_DIR, "intro_slides.html")
SLIDES_URL = "file:///" + SLIDES_PATH.replace("\\", "/")

# Recording resolution — 1660×980 keeps all dashboard elements fully visible
REC_WIDTH  = 1660
REC_HEIGHT = 980

def scene(name):
    print(f"\n[SCENE] {name}  ({DURATIONS[name]:.1f}s)", flush=True)

async def wait(page, seconds, label=""):
    if label:
        print(f"  -> {label} ({seconds:.1f}s)", flush=True)
    # Break into 5s chunks to avoid Playwright TargetClosedError on long waits
    remaining = float(seconds)
    CHUNK = 5.0
    while remaining > 0:
        chunk = min(CHUNK, remaining)
        await page.wait_for_timeout(int(chunk * 1000))
        remaining -= chunk

async def heartbeat(page):
    """Inject a tiny animation pixel so Playwright keeps recording frames."""
    await page.evaluate("""() => {
        const d = document.createElement('div');
        d.id = 'hb';
        d.style.cssText = 'position:fixed;bottom:0;right:0;width:1px;height:1px;z-index:99999;';
        document.body.appendChild(d);
        let f = 0;
        (function tick() { d.style.opacity = (f++ % 2) ? '0.99' : '1'; requestAnimationFrame(tick); })();
    }""")

async def safe_click(page, selector, timeout=4000):
    try:
        await page.wait_for_selector(selector, timeout=timeout)
        await page.click(selector)
        return True
    except:
        return False

async def safe_fill(page, selector, text, delay=55, timeout=4000):
    try:
        await page.wait_for_selector(selector, timeout=timeout)
        await page.click(selector)
        await page.type(selector, text, delay=delay)
        return True
    except:
        return False

async def slow_scroll(page, target_y, steps=10):
    """Smooth slow scroll to target_y."""
    await page.evaluate(f"""() => {{
        window.scrollTo({{ top: {target_y}, behavior: 'smooth' }});
    }}""")
    await page.wait_for_timeout(600)

async def highlight_element(page, selector, timeout=2000):
    """Briefly highlight an element with a pulse effect to help viewers see it."""
    try:
        await page.wait_for_selector(selector, timeout=timeout)
        await page.evaluate(f"""(sel) => {{
            const el = document.querySelector(sel);
            if (!el) return;
            el.style.transition = 'box-shadow 0.3s';
            el.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.6)';
            setTimeout(() => {{ el.style.boxShadow = ''; }}, 1800);
        }}""", selector)
    except:
        pass

async def record_demo():
    print("[START] aumtech.ai Demo Recorder v2 (fixed)", flush=True)
    print(f"[TARGET] {BASE_URL}", flush=True)
    print(f"[SLIDES] {SLIDES_URL}", flush=True)
    print(f"[RES]    {REC_WIDTH}x{REC_HEIGHT}", flush=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=[
                "--start-maximized",
                "--disable-infobars",
                "--no-sandbox",
            ],
        )
        context = await browser.new_context(
            record_video_dir=DEMO_DIR,
            record_video_size={"width": REC_WIDTH, "height": REC_HEIGHT},
            viewport={"width": REC_WIDTH, "height": REC_HEIGHT},
        )
        page = await context.new_page()

        # ── SCENE 01: Intro (animated slides, 72.55s) ─────────────────────
        #   Play the 4 intro slides — no static login screen
        scene("01_Intro")
        print("  -> Loading intro slides...", flush=True)
        await page.goto(SLIDES_URL, wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle")
        await heartbeat(page)

        # Hold on slides — the JS auto-advances them at 20/16/20/14s
        # We just wait for the full intro duration (72.55s)
        await wait(page, DURATIONS["01_Intro"], "playing 4 intro slides")

        # ── SCENE 02: Sign In (21.96s) ─────────────────────────────────────
        scene("02_SignIn")
        await page.goto(f"{BASE_URL}/login", wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle")
        await heartbeat(page)
        await wait(page, 2, "login page settles")

        # Fill email — try multiple selector strategies
        email_sel = "input[type='email'], input[name='email'], input[name='username'], input[placeholder*='email' i], input[placeholder*='university' i]"
        pass_sel  = "input[type='password'], input[name='password']"

        await safe_fill(page, email_sel, "student@university.edu", delay=60)
        await wait(page, 0.8)
        await safe_fill(page, pass_sel, "student123", delay=70)
        await wait(page, 0.8)

        # Highlight submit button before clicking
        await highlight_element(page, "button[type='submit']")
        await wait(page, 0.5)
        await safe_click(page, "button[type='submit']")

        try:
            await page.wait_for_selector(".sidebar, nav .nav-item, [class*='dashboard']", timeout=12000)
        except:
            pass
        await page.wait_for_load_state("networkidle")
        await wait(page, DURATIONS["02_SignIn"] - 10, "settle on dashboard")

        # ── SCENE 03: Dashboard (50.21s) ───────────────────────────────────
        scene("03_Dashboard")
        await heartbeat(page)

        # First: scroll down to highlight Quick Actions
        await wait(page, 3, "read greeting")
        await slow_scroll(page, 350)
        await wait(page, 4, "show Quick Actions")

        # Highlight Holds & Alerts card (the "Action required" one)
        await highlight_element(page, ".card-white")
        await wait(page, 3)

        # Scroll back up to show stats
        await slow_scroll(page, 0)
        await wait(page, 4, "show header stats — GPA and on-track")

        # Scroll down to show AI Support Team
        await slow_scroll(page, 700)
        await wait(page, 5, "show AI Support Team section")

        # Scroll back to top
        await slow_scroll(page, 0)
        await wait(page, DURATIONS["03_Dashboard"] - 22, "final dashboard overview")

        # ── SCENE 04: AI Navigator (62.26s) ────────────────────────────────
        scene("04_AINavigator")
        await safe_click(page, "text=AI Navigator")
        await wait(page, 2, "chat interface loads")

        # Type the question — realistic speed
        chat_input = "textarea, input[placeholder*='message'], input[placeholder*='ask'], input[placeholder*='type'], input[placeholder*='Ask']"
        await safe_fill(page, chat_input, "I failed my Calculus midterm — what should I do?", delay=50)
        await wait(page, 0.8)
        await page.keyboard.press("Enter")
        await wait(page, 8, "wait for AI response from Gemini")

        # Scroll to show the response
        await page.evaluate("window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})")
        await wait(page, 6, "reading AI response")

        # Scroll back up to show the full conversation
        await page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
        await wait(page, DURATIONS["04_AINavigator"] - 18, "read AI response complete")

        # ── SCENE 05: Courses & Degree Roadmap (35.78s) ────────────────────
        scene("05_Courses")
        await safe_click(page, "text=Courses")
        await wait(page, 2, "courses load")

        await slow_scroll(page, 300)
        await wait(page, 3)
        await slow_scroll(page, 0)
        await wait(page, 2)

        await safe_click(page, "text=Degree Roadmap")
        await wait(page, 2, "roadmap loads")

        # Show the full roadmap — it's pre-populated now with multiple semesters
        await slow_scroll(page, 300)
        await wait(page, 4, "showing populated semesters")
        await slow_scroll(page, 0)
        await wait(page, DURATIONS["05_Courses"] - 15, "degree roadmap overview")

        # ── SCENE 06: Tutoring Center (62.64s) ─────────────────────────────
        scene("06_Tutoring")
        await safe_click(page, "text=Tutoring Center")
        await wait(page, 3, "tutoring center loads with courses")

        # Highlight the Sync Roster button
        await highlight_element(page, "button:has-text('Sync')")
        await wait(page, 1.5)

        # Click Sync
        await safe_click(page, "button:has-text('Sync'), button:has-text('Sync Roster')")
        await wait(page, 3, "roster synced — CS101, MATH102, ENG101 shown")

        # Click on the first course card (CS 101) to book
        await safe_click(page, ".card-white:first-child, [class*='card']:first-child")
        await wait(page, 1.5, "booking modal opens")

        # Fill triage note
        await safe_fill(page, "textarea", "I am struggling with Python Lists and how they work with loops.", delay=45, timeout=3000)
        await wait(page, 1.5)

        # Set date and time
        await safe_fill(page, "input[type='date']", "2026-03-05", delay=50, timeout=2000)
        await safe_fill(page, "input[type='time']", "14:00", delay=50, timeout=2000)
        await wait(page, 1)

        # Confirm booking
        await safe_click(page, "button[type='submit']:has-text('Confirm'), button:has-text('Confirm Appointment'), button:has-text('Book')")
        await wait(page, DURATIONS["06_Tutoring"] - 18, "show booking confirmation")

        # ── SCENE 07: Wellness (30.05s) ────────────────────────────────────
        scene("07_Wellness")
        await safe_click(page, "text=Wellness")
        await wait(page, 2, "wellness loads")
        await slow_scroll(page, 200)
        await wait(page, 3)
        await safe_click(page, "text=Study Timer")
        await wait(page, DURATIONS["07_Wellness"] - 7, "study timer view")

        # ── SCENE 08: Holds & Alerts (29.42s) ─────────────────────────────
        scene("08_Holds")
        await safe_click(page, "text=Holds")
        await wait(page, 2, "holds load — shows active library fine")

        # Highlight the active hold card
        await highlight_element(page, ".card-white")
        await wait(page, 4, "reading hold details and resolution steps")

        # Highlight "How to fix?" button
        await highlight_element(page, "button:has-text('How to fix')")
        await wait(page, DURATIONS["08_Holds"] - 10, "hold resolution options shown")

        # ── SCENE 09: Financial Aid (39.29s) ───────────────────────────────
        scene("09_FinancialAid")
        await safe_click(page, "text=Financial Nexus")
        await wait(page, 2, "financial aid loads")

        await safe_click(page, "text=AI Match")
        await wait(page, 5, "AI scholarship matching")

        await slow_scroll(page, 400)
        await wait(page, DURATIONS["09_FinancialAid"] - 10, "show scholarship matches")

        # ── SCENE 10: Social Campus (29.06s) ───────────────────────────────
        scene("10_SocialCampus")
        await safe_click(page, "text=Social Campus")
        await wait(page, 3, "social campus loads with demo study groups")

        # Study groups are now populated — scroll to show them
        await slow_scroll(page, 300)
        await wait(page, 4, "showing study groups")

        # Click Peer Mentoring tab
        await safe_click(page, "text=Peer Mentoring")
        await wait(page, 3, "peer mentors shown")

        # Click Textbook Marketplace tab  
        await safe_click(page, "text=Textbook Marketplace")
        await wait(page, DURATIONS["10_SocialCampus"] - 13, "textbook listings shown")

        # ── SCENE 11: Admin Panel (45.70s) ─────────────────────────────────
        scene("11_AdminPanel")
        await safe_click(page, "text=Admin Panel, text=Admin")
        await wait(page, 2, "admin panel loads")
        await slow_scroll(page, 300)
        await wait(page, 4)
        await slow_scroll(page, 0)
        await wait(page, DURATIONS["11_AdminPanel"] - 8, "admin overview")

        # ── SCENE 12: Closing (36.70s) ─────────────────────────────────────
        scene("12_Closing")
        await safe_click(page, "text=Dashboard")
        await wait(page, 2, "return to dashboard")
        await slow_scroll(page, 0)
        await slow_scroll(page, 350)
        await wait(page, 4, "final wide shot Quick Actions")
        await slow_scroll(page, 0)
        await wait(page, DURATIONS["12_Closing"] - 8, "final wide shot")

        # ── Save video ──────────────────────────────────────────────────────
        print("\n[SAVING] Closing browser and saving video...", flush=True)
        raw_video = await page.video.path()
        await context.close()
        await browser.close()

        if os.path.exists(VIDEO_OUT):
            os.remove(VIDEO_OUT)
        shutil.copy(raw_video, VIDEO_OUT)
        print(f"[SAVED] Raw video: {VIDEO_OUT}", flush=True)
        return VIDEO_OUT


if __name__ == "__main__":
    path = asyncio.run(record_demo())
    print(f"\n[NEXT] Run: python demo/mix_demo.py  to produce the final MP4", flush=True)
