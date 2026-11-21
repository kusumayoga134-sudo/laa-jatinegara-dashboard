import os

TARGETS = ['Wesel W53C', 'Wesel W21A', 'isDot', 'cx', 'cy']
IGNORE = {'node_modules', '.git', 'dist'}

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in IGNORE]
    for file in files:
        if file.endswith(('.js', '.jsx', '.json')):
            p = os.path.join(root, file)
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    content = f.read()
                    for t in TARGETS:
                        if t in content:
                            print(f"Found '{t}' in {p}")
            except Exception as e:
                pass
