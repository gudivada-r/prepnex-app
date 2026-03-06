"""
Step 3: Mix the recorded browser video with the voiceover audio.
Run: python demo/mix_demo.py
Output: demo/aumtech_ai_demo.mp4
"""
import os
import sys
from moviepy.editor import (
    VideoFileClip, AudioFileClip, concatenate_audioclips
)

DEMO_DIR   = os.path.dirname(__file__)
VIDEO_IN   = os.path.join(DEMO_DIR, "recorded_browser.webm")
VIDEO_OUT  = os.path.join(DEMO_DIR, "aumtech_ai_demo.mp4")
VO_DIR     = os.path.join(DEMO_DIR, "voiceovers")

AUDIO_FILES = [
    "01_Intro.mp3",
    "02_SignIn.mp3",
    "03_Dashboard.mp3",
    "04_AINavigator.mp3",
    "05_Courses.mp3",
    "06_Tutoring.mp3",
    "07_Wellness.mp3",
    "08_Holds.mp3",
    "09_FinancialAid.mp3",
    "10_SocialCampus.mp3",
    "11_AdminPanel.mp3",
    "12_Closing.mp3",
]

def mix():
    if not os.path.exists(VIDEO_IN):
        print(f"[ERROR] Video not found: {VIDEO_IN}")
        print("        Run demo/record_demo.py first.")
        sys.exit(1)

    missing = [f for f in AUDIO_FILES if not os.path.exists(os.path.join(VO_DIR, f))]
    if missing:
        print(f"[ERROR] Missing audio files: {missing}")
        print("        Run demo/generate_voiceover.py first.")
        sys.exit(1)

    print("[LOADING] Reading audio clips...")
    clips = [AudioFileClip(os.path.join(VO_DIR, f)) for f in AUDIO_FILES]
    full_audio = concatenate_audioclips(clips)
    audio_dur  = full_audio.duration

    print("[LOADING] Reading video...")
    video = VideoFileClip(VIDEO_IN)
    video_dur = video.duration

    print(f"  Audio total : {audio_dur:.2f}s  ({audio_dur/60:.1f} min)")
    print(f"  Video total : {video_dur:.2f}s  ({video_dur/60:.1f} min)")

    # Align durations — take the shorter of the two to avoid silent gap or black frames
    final_dur = min(audio_dur, video_dur)
    print(f"  Final clip  : {final_dur:.2f}s  ({final_dur/60:.1f} min)")

    video      = video.subclip(0, final_dur)
    full_audio = full_audio.subclip(0, final_dur)
    final      = video.set_audio(full_audio)

    print(f"\n[RENDERING] Writing {VIDEO_OUT} ...")
    final.write_videofile(
        VIDEO_OUT,
        codec="libx264",
        audio_codec="aac",
        fps=24,
        preset="fast",
        threads=4,
        logger="bar"
    )

    print(f"\n[DONE] Final demo video: {VIDEO_OUT}")
    size_mb = os.path.getsize(VIDEO_OUT) / (1024 * 1024)
    print(f"       File size: {size_mb:.1f} MB")


if __name__ == "__main__":
    mix()
