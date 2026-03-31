import os

replacements = {
    '#0F172A': '#1b679a',
    '#1E293B': '#114a72',
    '#334155': '#1a5d8b',
    '#475569': '#30779e',
    '#64748B': '#488eb4',
    '#94A3B8': '#78adcc',
    '#CBD5E1': '#b3d2e3',
    '#E2E8F0': '#cfe3ee',
    '#F1F5F9': '#e8f2f8',
    '#F8FAFC': '#f4f9fb',
    '#FAFAFA': '#f7fafb',
    '#3B82F6': '#36bef6',
    '#38BDF8': '#36bef6',
    '#10B981': '#25b14c',
    '#065F46': '#156d2e',
    '#ECFDF5': '#e3f6e8',
    '#F59E0B': '#fed206',
    '#92400E': '#8b7501',
    '#FFFBEB': '#fffce0',
    '#EF4444': '#e50a86',
    '#991B1B': '#890650',
    '#FEF2F2': '#fce4f2',
    '#DC2626': '#c80975',
    '#FECACA': '#f3b2d7',
    '#FCA5A5': '#ed88c2',
}

target_dir = r"d:\Contract manager\Contract-ui\contract-manager\src"

def process_file(filepath):
    if not filepath.endswith('.js') and not filepath.endswith('.css'):
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    for old, new in replacements.items():
        # Replace completely uppercase
        content = content.replace(old, new.upper())
        # Replace lowercase forms just in case
        content = content.replace(old.lower(), new.upper())

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated colors in {filepath}")

for root, _, files in os.walk(target_dir):
    for filename in files:
        process_file(os.path.join(root, filename))

print("Rizo brand palette injection standard completed.")
