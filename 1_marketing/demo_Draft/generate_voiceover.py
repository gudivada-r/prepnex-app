"""
Step 1: Generate voiceover MP3 files for each scene.
Run: python demo/generate_voiceover.py
Output: demo/voiceovers/*.mp3
"""
import asyncio
import edge_tts
import os

VOICE = "en-US-ChristopherNeural"  # Professional male voice
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "voiceovers")

SCRIPT = {
    "01_Intro": (
        "For decades, higher education has been the last frontier untouched by the AI revolution. "
        "Healthcare got diagnostic AI. Finance got algorithmic intelligence. Legal got contract automation. "
        "But the place where human potential is shaped the most — the university — has been left behind, "
        "running on spreadsheets, siloed portals, and overburdened advisors who simply cannot give every student "
        "the attention they deserve. Until now. "
        "Meet aumtech dot ai — the world's first Agentic Student Success Platform. "
        "Not a chatbot. Not a dashboard. An intelligent academic operating system that thinks alongside "
        "every student, every day — from enrollment to graduation. "
        "We are not adding AI to education. We are rebuilding the student experience from the ground up with AI at its core. "
        "What you are about to see is a live, fully deployed system — handling real academic advising, "
        "intelligent tutoring triage, financial aid matching, and institutional analytics — "
        "all powered by Google Gemini and built for universities at scale. Let's go."
    ),

    "02_SignIn": (
        "The sign-in experience is clean and professional. Students log in with their university credentials. "
        "What happens next is immediate — our AI backend instantly loads their personalized profile: "
        "courses, GPA trends, outstanding holds, and a dynamically generated AI insight — "
        "all before the page even finishes rendering."
    ),

    "03_Dashboard": (
        "Welcome to the Student Dashboard. The very first thing a student sees is a warm, personalized greeting "
        "from the AI Navigator — noticing the time of day, their academic progress, and surfacing the most "
        "important action items right away. "
        "In the center, we have the On-Track Score — a real-time metric reflecting GPA, assignment completion, "
        "holds status, and wellness across all courses. "
        "Quick Actions give one-click access to the most common student needs: checking holds, booking an advisor, "
        "or starting an AI conversation. "
        "On the left sidebar, the navigation panel organizes everything across five categories: Home, Academics, "
        "Resources, Campus Life, and Administrative. No hunting around. Everything is exactly where you expect it."
    ),

    "04_AINavigator": (
        "At the heart of aumtech dot ai is the AI Navigator — a conversational academic agent powered by Google Gemini. "
        "This isn't a generic chatbot. It knows this student. It has access to their enrolled courses, "
        "GPA history, and academic calendar. Watch this. "
        "I'll ask: I failed my Calculus midterm — what should I do? "
        "Incredible. In seconds, the AI analyzed the student's full academic context, identified Calculus Two "
        "as the struggling course, recommended booking a tutoring session, flagged an upcoming retake opportunity, "
        "and suggested the appropriate academic petition form — all in natural language. "
        "Every conversation is saved in the chat history panel. Students can return to prior sessions, "
        "pick up exactly where they left off, and export key advice. "
        "This is truly a next-generation academic advising experience — available twenty-four-seven, "
        "not just during office hours."
    ),

    "05_Courses": (
        "Under Academics, students get a crystal-clear view of every course they are taking — "
        "grades, credit hours, and AI-generated improvement suggestions appear automatically. "
        "But we go further. Click on the Degree Roadmap — and now the student sees their entire academic journey "
        "laid out visually. Which credits are complete. Which are in progress. What is missing before they can graduate. "
        "No more mysterious holds about missing prerequisites. "
        "The AI Navigator proactively surfaces gaps before they become problems."
    ),

    "06_Tutoring": (
        "One of aumtech dot ai's most powerful features is the intelligent Tutoring System, "
        "built on what we call Roster Truth — the system syncs directly with the university's learning management system, "
        "whether it is Canvas or Blackboard, to know exactly which courses a student is enrolled in. "
        "Watch what happens when a student tries to book a session. "
        "Their full course schedule — CS one-oh-one, Calculus Two, Academic Writing — all verified live from the L M S. "
        "Now they select Intro to Computer Science, enter a triage note: I am struggling with Python Lists, "
        "and attach a screenshot of their error. "
        "In under two seconds, three things happen simultaneously: "
        "Our AI analyzes the triage note and generates a concise brief for the Teaching Assistant. "
        "Our Round Robin load balancer assigns the T A with the lowest current workload. "
        "And a confirmation email is sent to the student instantly. "
        "This is not just scheduling. This is intelligent academic triage at scale."
    ),

    "07_Wellness": (
        "aumtech dot ai doesn't just track grades — it cares about the whole student. "
        "The Wellness Check-In is a brief, thoughtful survey. Responses are processed by the AI to personalize "
        "recommendations — a study break, a campus resource, or a gentle nudge toward counseling services. "
        "And for students who need focus, the Study Timer provides a built-in Pomodoro-style productivity tool. "
        "Session data is even factored into the on-track score."
    ),

    "08_Holds": (
        "One of the biggest sources of student frustration is the mystery hold — "
        "a financial or administrative block that prevents registration, with zero explanation of how to resolve it. "
        "aumtech dot ai's Holds Center shows every active hold in plain language: what it is, why it exists, "
        "how much is owed if applicable, and exactly what the student needs to do to resolve it. "
        "One click initiates resolution — no more emailing three different offices to figure out why you cannot register."
    ),

    "09_FinancialAid": (
        "Financial stress is one of the top reasons students drop out. "
        "aumtech dot ai tackles this head-on with the Financial Aid Nexus. "
        "The platform surfaces available scholarships tailored to the student's profile. "
        "Click AI Match, and Gemini instantly analyzes the student's GPA, major, background, and interests "
        "against every available scholarship — ranking them by fit with a personal explanation. "
        "Even more powerful: click Draft Statement, and the AI writes a personalized, professional scholarship essay — "
        "ready to review and submit. What used to take days of writing now takes seconds."
    ),

    "10_SocialCampus": (
        "College is not just academics — it is community. The Social Campus module connects students with each other. "
        "The Study Buddy Finder matches students taking the same courses so they can form groups and study together. "
        "The Peer Mentoring hub lets upperclassmen offer guidance to incoming students. "
        "And the Textbook Marketplace? Students can buy and sell textbooks directly within the platform — "
        "no third-party sites, no awkward meetups."
    ),

    "11_AdminPanel": (
        "Now let's flip to the administrator view — what university leadership and advising staff see. "
        "The Admin Panel gives leadership a live dashboard of every student, ranked by academic risk. "
        "High G P A students are flagged green. Students in trouble are flagged red, with full context. "
        "From here, admins can launch targeted outreach campaigns in a single click — "
        "select at-risk students in a specific major, write a message, send — "
        "and the system logs every campaign with full audit trails. "
        "And through the Tutoring Analytics dashboard, the Dean can see which courses have the highest demand, "
        "which topics students struggle with most, and how effectively the T A team responds — all in real time."
    ),

    "12_Closing": (
        "aumtech dot ai is more than software — it is a mission. "
        "We believe every student, regardless of background, deserves the kind of personalized, "
        "intelligent academic support that used to be reserved for those who could afford private tutors "
        "and premium advising services. "
        "With AI-powered advising, intelligent tutoring triage, real-time analytics, and a platform "
        "designed from the ground up around the student experience — "
        "aumtech dot ai is ready to transform student success at scale. "
        "We are live at aumtech dot ai. Let's give every student their own Navigator."
    ),
}

async def generate_audio():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"[GENERATING] {len(SCRIPT)} audio files using voice: {VOICE}")
    print(f"[OUTPUT DIR] {OUTPUT_DIR}\n")

    for filename, text in SCRIPT.items():
        output_file = os.path.join(OUTPUT_DIR, f"{filename}.mp3")
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(output_file)
        size_kb = os.path.getsize(output_file) // 1024
        print(f"  [OK] {filename}.mp3  ({size_kb} KB)")

    print(f"\n[DONE] All {len(SCRIPT)} audio files saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    asyncio.run(generate_audio())
