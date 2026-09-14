import os
import re

directory = "src/app"

roles_to_remove = ["'admin'", '"admin"', "'dean'", '"dean"', "'dept_head'", '"dept_head"', "'parent'", '"parent"']

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    # Find all allowedRoles={[...]}
    pattern = re.compile(r'allowedRoles=\{\[([^\]]+)\]\}')
    
    def replacer(match):
        inner = match.group(1)
        # remove the bad roles
        for role in roles_to_remove:
            inner = re.sub(rf'{role}\s*,\s*', '', inner)
            inner = re.sub(rf',\s*{role}', '', inner)
            inner = re.sub(rf'{role}', '', inner)
        return f'allowedRoles={{[{inner}]}}'

    content = pattern.sub(replacer, content)

    # Some might be defined outside
    # like `['super_admin', 'admin', ...].includes`
    # Let's just blindly remove them everywhere in the file since they shouldn't exist
    for role in roles_to_remove:
        content = re.sub(rf'{role}\s*,\s*', '', content)
        content = re.sub(rf',\s*{role}', '', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            process_file(os.path.join(root, file))
