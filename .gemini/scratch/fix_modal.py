import re

with open('src/app/admin/products/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# find modal content
modal_start = content.find('{/* ── Modal ── */}')
modal_content = content[modal_start:]
original_modal = modal_content

# remove all dark: classes
modal_content = re.sub(r'\s*dark:[a-zA-Z0-9_/-]+\[?[a-zA-Z0-9_/#]*\]?', '', modal_content)

# replace text-foreground with text-gray-900
modal_content = re.sub(r'text-foreground/40', 'text-gray-500', modal_content)
modal_content = re.sub(r'text-foreground/50', 'text-gray-600', modal_content)
modal_content = re.sub(r'text-foreground/60', 'text-gray-500', modal_content)
modal_content = re.sub(r'text-foreground/80', 'text-gray-800', modal_content)
modal_content = re.sub(r'text-foreground', 'text-gray-900', modal_content)

content = content[:modal_start] + modal_content

with open('src/app/admin/products/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
