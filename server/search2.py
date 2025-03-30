import openai
from config import OPENAI_API_KEY
openai.api_key = OPENAI_API_KEY

# Load Super Note
with open("notes/super_note.txt", "r", encoding="utf-8") as f:
    super_note = f.read()

# AI Prompt for validation & enhancement
prompt = f"""
Analyze the following Super Note:
- Identify and correct factual errors.
- Fix any spelling or grammatical mistakes.
- Enhance content with more useful details.

{super_note}
"""

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.3
)

perfect_note = response.choices[0].message.content.strip()

# Save Perfect Note
with open("notes/perfect_note.txt", "w", encoding="utf-8") as f:
    f.write(perfect_note)

print("✅ Perfect Note created successfully!")
