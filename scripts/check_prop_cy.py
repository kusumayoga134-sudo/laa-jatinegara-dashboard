import os
import re

IGNORE = {'node_modules', '.git', 'dist'}

for root, dirs, files in os.walk('frontend'):
    dirs[:] = [d for d in dirs if d not in IGNORE]
    for file in files:
        if file.endswith(('.js', '.jsx')):
            p = os.path.join(root, file)
            with open(p, 'r', encoding='utf-8') as f:
                content = f.read()
                # Check for cx= or cy= or cx: or cy:
                matches = re.findall(r'\b(cx|cy)\s*[:=]', content)
                if matches:
                    print(f"Matched {set(matches)} in {p}")
