import os

TARGETS = ['1419', '1480', '4257', '9600', '5920', 'LANE_TOP_H', 'LANE_BOTTOM_H']
# Note: 9825 is also the new width 9825x5505 (3275 * 3 = 9825), so we check context of 9825
IGNORE_DIRS = {'node_modules', '.git', 'dist', 'build', '.vscode', '__pycache__', 'coverage'}
EXTENSIONS = {'.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.py', '.md'}

matches = []

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
    for file in files:
        ext = os.path.splitext(file)[1].lower()
        if ext in EXTENSIONS:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    for line_num, line in enumerate(f, 1):
                        for target in TARGETS:
                            if target in line:
                                matches.append((file_path, line_num, target, line.strip()))
            except Exception as e:
                pass

print(f"Total matches found: {len(matches)}")
for file_path, line_num, target, line in matches:
    print(f"{file_path}:{line_num} [{target}] -> {line[:120]}")
