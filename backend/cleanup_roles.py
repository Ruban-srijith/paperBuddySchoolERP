import os
import re

directory = "app"

roles_to_remove = ["UserRole.ADMIN", "UserRole.DEAN", "UserRole.DEPT_HEAD", "UserRole.PARENT"]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content

    for role in roles_to_remove:
        # Match `UserRole.ADMIN, `
        content = re.sub(rf'{role},\s*', '', content)
        # Match `, UserRole.ADMIN`
        content = re.sub(rf',\s*{role}', '', content)
        # Match `UserRole.ADMIN` (when it's alone or remaining)
        content = re.sub(rf'{role}', '', content)

    if content != original_content:
        # Clean up empty lists or trailing commas just in case
        content = content.replace("require_role()", "require_role(UserRole.SUPER_ADMIN)") # Fallback if empty
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".py"):
            process_file(os.path.join(root, file))

# Also process tests
for root, _, files in os.walk("tests"):
    for file in files:
        if file.endswith(".py"):
            process_file(os.path.join(root, file))

# Process schemas
for root, _, files in os.walk("app/schemas"):
    for file in files:
        if file.endswith(".py"):
            process_file(os.path.join(root, file))
