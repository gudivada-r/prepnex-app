import os
import sys
import json
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeAudioClip

DEMO_DIR   = os.path.dirname(__file__)
VIDEO_IN   = os.path.join(DEMO_DIR, "recorded_browser.webm")
VIDEO_OUT  = os.path.join(DEMO_DIR, "aumtech_ai_demo.mp4")
VO_DIR     = os.path.join(DEMO_DIR, "voiceovers")
TIMINGS    = os.path.join(DEMO_DIR, "timings.json")

AUDIO_MAP = [
    ("01_Hook_EdNex", "01_Hook_EdNex.mp3"),
    ("02_Aura_Tiers", "02_Aura_Tiers.mp3"),
    ("03_SignIn", "03_SignIn.mp3"),
    ("04_Dashboard", "04_Dashboard.mp3"),
    ("05_GetAuraChat", "05_GetAuraChat.mp3"),
    ("06_Courses", "06_Courses.mp3"),
    ("07_Tutoring", "07_Tutoring.mp3"),
    ("08_Wellness", "08_Wellness.mp3"),
    ("09_Holds", "09_Holds.mp3"),
    ("10_FinancialAid", "10_FinancialAid.mp3"),
    ("11_SocialCampus", "11_SocialCampus.mp3"),
    ("12_AdminPanel", "12_AdminPanel.mp3"),
    ("13_TCO", "13_TCO.mp3"),
    ("14_Closing", "14_Closing.mp3")
]

def mix():
    if not os.path.exists(VIDEO_IN):
        print(f"[ERROR] Video not found: {VIDEO_IN}")
        sys.exit(1)
    if not os.path.exists(TIMINGS):
        print(f"[ERROR] Timings not found: {TIMINGS}")
        sys.exit(1)

    with open(TIMINGS, "r") as f:
        timings_data = json.load(f)

    print("[LOADING] Processing audio clips with offsets...")
    audio_clips = []
    for scene_key, audio_file in AUDIO_MAP:
        audio_path = os.path.join(VO_DIR, audio_file)
        if not os.path.exists(audio_path):
            print(f"[WARN] Audio file missing: {audio_path}")
            continue
        
        start_offset = timings_data.get(scene_key)
        if start_offset is None:
            print(f"[WARN] No timing for scene: {scene_key}")
            continue
            
        print(f"  -> {scene_key} starts at {start_offset:.2f}s")
        clip = AudioFileClip(audio_path).set_start(start_offset)
        audio_clips.append(clip)

    full_audio = CompositeAudioClip(audio_clips)
    
    print("[LOADING] Reading video...")
    video = VideoFileClip(VIDEO_IN)
    
    # Trim video to match end of last audio clip or video duration
    final_dur = full_audio.duration
    if final_dur > video.duration:
        print(f"[WARN] Audio ({final_dur:.2f}s) is longer than video ({video.duration:.2f}s). Trimming audio.")
        final_dur = video.duration
        full_audio = full_audio.subclip(0, final_dur)
    else:
        video = video.subclip(0, final_dur)

    final = video.set_audio(full_audio)

    print(f"\n[RENDERING] Writing {VIDEO_OUT} ...")
    # Using higher quality settings
    final.write_videofile(VIDEO_OUT, codec="libx264", audio_codec="aac", fps=30, preset="medium", bitrate="5000k", threads=4)
    print(f"\n[DONE] Final synced demo video: {VIDEO_OUT}")

if __name__ == "__main__":
    mix()
