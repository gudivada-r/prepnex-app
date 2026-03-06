"""
record_demo_v2.py  -  aumtech.ai Demo Recorder (v2, fixed)
===========================================================
Fixes over v1:
  - headless=True  -> zero browser chrome, zero gray bars, pure clean capture
  - Recording at 1920x1080 (proper 16:9 HD)
  - Playwright controls slide advancement directly (no JS timer race)
  - HTML slides use 100vw/100vh -- fill viewport exactly
  - Proper login wait loop (waits for actual dashboard element)
  - Chunked waits (5s max each) to avoid TargetClosedError
  - Output saved to  demo/v2/recorded_browser.webm  (new version folder)

Run: python demo/record_demo_v2.py
"""
import asyncio
import os
import sys
import shutil
from playwright.async_api import async_playwright

# Force UTF-8 output so Windows cp1252 doesn't choke on special chars
sys.stdout.reconfigure(encoding="utf-8")

# ── Exact voiceover durations (seconds) ──────────────────────────────────────
DURATIONS = {
    "01_Intro":        72.55,
    "02_SignIn":       21.96,
    "03_Dashboard":    50.21,
    "04_AINavigator":  62.26,
    "05_Courses":      35.78,
    "06_Tutoring":     62.64,
    "07_Wellness":     30.05,
    "08_Holds":        29.42,
    "09_FinancialAid": 39.29,
    "10_SocialCampus": 29.06,
    "11_AdminPanel":   45.70,
    "12_Closing":      36.70,
}

# ── Config ────────────────────────────────────────────────────────────────────
DEMO_DIR    = os.path.dirname(os.path.abspath(__file__))
V2_DIR      = os.path.join(DEMO_DIR, "v2")
VIDEO_OUT   = os.path.join(V2_DIR, "recorded_browser.webm")
SLIDES_PATH = os.path.join(DEMO_DIR, "intro_slides.html")
SLIDES_URL  = "file:///" + SLIDES_PATH.replace("\\", "/")
BASE_URL    = "https://aumtech.ai"

# 1920x1080 = proper full HD, no browser chrome in headless mode
REC_W, REC_H = 1920, 1080

os.makedirs(V2_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def log(msg):
    print(msg, flush=True)

def scene(name):
    log("\n" + "=" * 60)
    log(f"[SCENE] {name}  ({DURATIONS[name]:.1f}s)")
    log("=" * 60)

async def wait(page, secs, label=""):
    """Chunked wait -- avoids single large timeout crashing Playwright."""
    if label:
        log(f"  -> {label} ({secs:.1f}s)")
    remaining = float(secs)
    while remaining > 0:
        chunk = min(4.9, remaining)
        await page.wait_for_timeout(int(chunk * 1000))
        remaining -= chunk

async def go(page, url, label=""):
    if label:
        log(f"  -> navigating: {label}")
    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_load_state("networkidle")

async def click(page, selector, label="", timeout=5000):
    try:
        await page.wait_for_selector(selector, timeout=timeout)
        if label:
            log(f"  -> clicking: {label}")
        await page.click(selector)
        return True
    except Exception as e:
        log(f"  [skip click '{label}']")
        return False

async def fill(page, selector, text, delay=55, timeout=5000):
    try:
        await page.wait_for_selector(selector, timeout=timeout)
        await page.click(selector)
        await page.type(selector, text, delay=delay)
        return True
    except Exception as e:
        log(f"  [skip fill '{selector}']")
        return False

async def scroll(page, y):
    await page.evaluate(f"window.scrollTo({{top:{y},behavior:'smooth'}})")
    await page.wait_for_timeout(700)

async def glow(page, selector, timeout=2000):
    """Highlight an element with a brief pulse ring."""
    try:
        await page.wait_for_selector(selector, timeout=timeout)
        await page.evaluate("""(sel) => {
            const el = document.querySelector(sel);
            if (!el) return;
            el.style.transition = 'box-shadow 0.25s';
            el.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.7), 0 0 24px rgba(99,102,241,0.4)';
            setTimeout(() => { el.style.boxShadow = ''; }, 2200);
        }""", selector)
    except Exception:
        pass

async def inject_heartbeat(page):
    """Tiny 1px animated element keeps Playwright recording frames."""
    await page.evaluate("""() => {
        if (document.getElementById('__hb')) return;
        const d = document.createElement('div');
        d.id = '__hb';
        d.style.cssText = 'position:fixed;bottom:1px;right:1px;width:1px;height:1px;z-index:999999;pointer-events:none;';
        document.body.appendChild(d);
        let t = 0;
        (function tick() { d.style.opacity = (t++ % 2 === 0) ? '1' : '0.99'; requestAnimationFrame(tick); })();
    }""")

# ─────────────────────────────────────────────────────────────────────────────
# Main recording coroutine
# ─────────────────────────────────────────────────────────────────────────────
async def record():
    log("=" * 60)
    log("  aumtech.ai Demo Recorder  v2  (clean headless 1920x1080)")
    log(f"  Output  -> {VIDEO_OUT}")
    log(f"  Resolution -> {REC_W}x{REC_H}")
    log("=" * 60)

    async with async_playwright() as pw:
        # headless=True -> no OS window chrome, pristine 1920x1080 recording
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--hide-scrollbars",
                "--disable-web-security",
                "--allow-file-access-from-files",
            ]
        )
        ctx = await browser.new_context(
            record_video_dir=V2_DIR,
            record_video_size={"width": REC_W, "height": REC_H},
            viewport={"width": REC_W, "height": REC_H},
            device_scale_factor=1,
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/121.0.0.0 Safari/537.36"
            ),
        )
        page = await ctx.new_page()

        # ── SCENE 01 : Intro slides (72.55s = 20 + 16 + 20 + 16.55) ─────────
        scene("01_Intro")
        await go(page, SLIDES_URL, "intro_slides.html")
        await inject_heartbeat(page)
        await wait(page, 1, "slide load settle")

        log("  -> slide 1: Students Are Left Behind  (20s)")
        await wait(page, 20)

        # Playwright advances slides -- no JS timer race conditions
        await page.evaluate("window.goToSlide(1)")
        log("  -> slide 2: Cost of Doing Nothing  (16s)")
        await wait(page, 16)

        await page.evaluate("window.goToSlide(2)")
        log("  -> slide 3: Introducing aumtech.ai  (20s)")
        await wait(page, 20)

        await page.evaluate("window.goToSlide(3)")
        log("  -> slide 4: Brand title  (remaining)")
        await wait(page, DURATIONS["01_Intro"] - 57, "brand title")

        # ── SCENE 02 : Sign In (21.96s) ──────────────────────────────────────
        scene("02_SignIn")
        await go(page, f"{BASE_URL}/login", "login page")
        await inject_heartbeat(page)
        await wait(page, 2, "login page renders")

        email_sel = "input[type='email'], input[name='email'], input[name='username']"
        pass_sel  = "input[type='password']"
        await fill(page, email_sel, "student@university.edu", delay=60)
        await wait(page, 0.6)
        await fill(page, pass_sel,  "student123", delay=70)
        await wait(page, 0.6)
        await glow(page, "button[type='submit']")
        await wait(page, 0.5)
        await click(page, "button[type='submit']", "submit login")

        # Wait for dashboard
        try:
            await page.wait_for_selector(
                ".sidebar, .nav-item, [class*='dashboard'], .hero-card",
                timeout=14000,
            )
        except Exception:
            pass
        await page.wait_for_load_state("networkidle")
        await wait(page, DURATIONS["02_SignIn"] - 10, "settle on dashboard")

        # ── SCENE 03 : Dashboard (50.21s) ─────────────────────────────────────
        scene("03_Dashboard")
        await inject_heartbeat(page)
        await wait(page, 2, "read greeting")

        await glow(page, ".hero-card, .stat-card-glass")
        await wait(page, 4, "GPA and on-track score cards")

        await scroll(page, 380)
        await wait(page, 3, "Quick Actions visible")
        await glow(page, ".card-white")
        await wait(page, 3)

        await scroll(page, 760)
        await wait(page, 4, "AI Support Team visible")

        await scroll(page, 0)
        await wait(page, DURATIONS["03_Dashboard"] - 18, "full dashboard overview")

        # ── SCENE 04 : AI Navigator (62.26s) ──────────────────────────────────
        scene("04_AINavigator")
        await click(page, "text=AI Navigator", "navigate to AI chat")
        await wait(page, 2, "chat interface loads")
        await inject_heartbeat(page)

        chat_input = (
            "textarea[placeholder], "
            "input[placeholder*='Ask'], input[placeholder*='message'], "
            "input[placeholder*='type']"
        )
        await fill(
            page, chat_input,
            "I failed my Calculus midterm -- what should I do to recover my grade?",
            delay=48, timeout=6000
        )
        await wait(page, 0.8)
        await page.keyboard.press("Enter")
        await wait(page, 9, "Gemini AI generating response")

        await page.evaluate("window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})")
        await wait(page, 6, "reading AI response")
        await page.evaluate("window.scrollTo({top:0,behavior:'smooth'})")
        await wait(page, DURATIONS["04_AINavigator"] - 19, "AI response fully read")

        # ── SCENE 05 : Courses + Degree Roadmap (35.78s) ─────────────────────
        scene("05_Courses")
        await click(page, "text=Courses", "navigate to Courses")
        await wait(page, 2, "courses load")
        await scroll(page, 300)
        await wait(page, 3)
        await scroll(page, 0)

        await click(page, "text=Degree Roadmap", "navigate to Degree Roadmap")
        await wait(page, 2, "roadmap loads")
        await scroll(page, 300)
        await wait(page, 4, "populated semesters visible")
        await scroll(page, 0)
        await wait(page, DURATIONS["05_Courses"] - 13, "roadmap overview")

        # ── SCENE 06 : Tutoring Center (62.64s) ──────────────────────────────
        scene("06_Tutoring")
        await click(page, "text=Tutoring Center", "navigate to Tutoring")
        await wait(page, 3, "tutoring loaded - CS101 MATH102 ENG101 shown")

        await glow(page, "button:has-text('Sync'), [class*='sync']")
        await wait(page, 1.5)
        await click(page, "button:has-text('Sync'), button:has-text('Sync Roster')", "sync roster")
        await wait(page, 3, "roster synced")

        await click(page, ".card-white, [class*='course-card']", "open CS101 booking", timeout=3000)
        await wait(page, 2, "booking form open")

        await fill(page, "textarea", "I need help with Python -- specifically Lists and loops.", delay=45, timeout=3000)
        await wait(page, 1)
        await fill(page, "input[type='date']", "2026-03-10", delay=40, timeout=2000)
        await fill(page, "input[type='time']", "14:00", delay=40, timeout=2000)
        await wait(page, 1)
        await click(
            page,
            "button[type='submit']:has-text('Confirm'), button:has-text('Confirm Appointment'), button:has-text('Book')",
            "confirm booking", timeout=3000
        )
        await wait(page, DURATIONS["06_Tutoring"] - 18, "booking confirmation shown")

        # ── SCENE 07 : Wellness + Study Timer (30.05s) ───────────────────────
        scene("07_Wellness")
        await click(page, "text=Wellness", "navigate to Wellness")
        await wait(page, 2, "wellness loads")
        await scroll(page, 250)
        await wait(page, 3)
        await click(page, "text=Study Timer", "navigate to Study Timer")
        await wait(page, DURATIONS["07_Wellness"] - 7, "study timer view")

        # ── SCENE 08 : Holds and Alerts (29.42s) ─────────────────────────────
        scene("08_Holds")
        await click(page, "text=Holds", "navigate to Holds and Alerts")
        await wait(page, 2, "holds load - active library fine visible")
        await glow(page, ".card-white")
        await wait(page, 4, "reading library fine details")
        await glow(page, "button:has-text('How'), button:has-text('Pay'), button:has-text('Resolve')")
        await wait(page, DURATIONS["08_Holds"] - 9, "hold resolution info shown")

        # ── SCENE 09 : Financial Aid (39.29s) ────────────────────────────────
        scene("09_FinancialAid")
        await click(page, "text=Financial Nexus", "navigate to Financial Aid")
        await wait(page, 2, "financial aid loads")
        await click(page, "text=AI Match", "AI scholarship matching", timeout=4000)
        await wait(page, 5, "AI matching scholarships")
        await scroll(page, 350)
        await wait(page, DURATIONS["09_FinancialAid"] - 10, "scholarship list visible")

        # ── SCENE 10 : Social Campus (29.06s) ────────────────────────────────
        scene("10_SocialCampus")
        await click(page, "text=Social Campus", "navigate to Social Campus")
        await wait(page, 3, "social campus loads with study groups")
        await scroll(page, 300)
        await wait(page, 4, "study groups visible")
        await click(page, "text=Peer Mentoring", "switch to Peer Mentoring tab", timeout=3000)
        await wait(page, 3, "peer mentors shown")
        await click(page, "text=Textbook Marketplace", "switch to Textbook Marketplace", timeout=3000)
        await wait(page, DURATIONS["10_SocialCampus"] - 12, "textbook listings shown")

        # ── SCENE 11 : Admin Panel (45.70s) ──────────────────────────────────
        scene("11_AdminPanel")
        await click(page, "text=Admin Panel, .nav-item:has-text('Admin')", "navigate to Admin Panel", timeout=4000)
        await wait(page, 2, "admin panel loads")
        await scroll(page, 300)
        await wait(page, 4)
        await scroll(page, 0)
        await wait(page, DURATIONS["11_AdminPanel"] - 8, "admin overview")

        # ── SCENE 12 : Closing (36.70s) ──────────────────────────────────────
        scene("12_Closing")
        await click(page, "text=Dashboard, .nav-item:has-text('Dashboard')", "return to Dashboard")
        await wait(page, 2, "dashboard loaded")
        await scroll(page, 0)
        await wait(page, 3, "final wide shot - top")
        await scroll(page, 380)
        await wait(page, 4, "Quick Actions closing shot")
        await scroll(page, 0)
        await wait(page, DURATIONS["12_Closing"] - 11, "end of demo")

        # ── Save video ────────────────────────────────────────────────────────
        log("\n[SAVING] Closing browser and saving raw video...")
        raw = await page.video.path()
        await ctx.close()
        await browser.close()

        if os.path.exists(VIDEO_OUT):
            os.remove(VIDEO_OUT)
        shutil.copy(raw, VIDEO_OUT)
        log(f"[SAVED]  {VIDEO_OUT}")
        return VIDEO_OUT


if __name__ == "__main__":
    path = asyncio.run(record())
    log("\n[NEXT] Run:  python demo/mix_demo_v2.py  to produce aumtech_ai_demo_v2.mp4")
