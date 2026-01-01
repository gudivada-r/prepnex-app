import os
from PIL import Image

def resize_screenshots():
    source_dir = r"c:\Projects\AA\SS_12_26\app_store_screenshots"
    target_width = 1284
    target_height = 2778
    
    files = [f for f in os.listdir(source_dir) if f.endswith('.png') and f != 'README.md']
    
    print(f"Resizing {len(files)} screenshots to {target_width}x{target_height}...")
    
    for filename in files:
        filepath = os.path.join(source_dir, filename)
        with Image.open(filepath) as img:
            # Resize using Lanczos for high quality
            resized_img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            resized_img.save(filepath, "PNG")
            print(f"DONE: Resized {filename}")

if __name__ == "__main__":
    resize_screenshots()
