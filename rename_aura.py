import os

root_dir = r"c:\Projects\AA\at"
exclude_dirs = {'.git', 'node_modules', '__pycache__', '.vercel', 'apple_certs', 'build', 'dist', '.expo', 'ios', 'android'}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return False
        
    new_content = content
    new_content = new_content.replace("GET AURA", "GET AURA")
    new_content = new_content.replace("Get Aura", "Get Aura")
    new_content = new_content.replace("Get Aura", "Get Aura")
    new_content = new_content.replace("get aura", "get aura")
    new_content = new_content.replace("aumtech.ai Get Aura", "aumtech.ai Get Aura")

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

count = 0
for dirpath, dirnames, filenames in os.walk(root_dir):
    dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
    for filename in filenames:
        if filename.endswith(('.exe', '.png', '.jpg', '.jpeg', '.gif', '.zip', '.pyc', '.css.map', '.js.map', '.ico', '.svg', '.mov', '.pdf', '.mp4')):
            continue
        filepath = os.path.join(dirpath, filename)
        if replace_in_file(filepath):
            count += 1
            print(f"Updated {filepath}")

print(f"Replaced in {count} files total.")
