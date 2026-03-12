import os
from moviepy.editor import AudioFileClip

D = os.path.join(r"c:\Projects\AA\at\3_code\demo\DEMO2\voiceovers")
durs = {}
for f in sorted(os.listdir(D)):
    if f.endswith(".mp3"):
        clip = AudioFileClip(os.path.join(D, f))
        print(f'"{f.replace(".mp3", "")}": {clip.duration:.2f},')
