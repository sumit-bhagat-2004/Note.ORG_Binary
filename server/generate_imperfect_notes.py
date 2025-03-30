import openai
import random
import os
from config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

with open("notes/perfect_note.txt", "r", encoding="utf-8") as file:
    perfect_note = file.read()

imperfection_levels = [5, 10, 15, 20, 25]

def introduce_human_like_imperfections(note, imperfection_percentage):
    """
    Generates an imperfect note with a specified percentage of errors.
    The errors include:
    - Randomly removing different words or lines in each variation
    - Introducing random factual mistakes
    - Removing whole paragraphs for higher imperfection levels
    - Misspelling words randomly
    - Keeping variations random so no two versions have the same mistakes
    """

    prompt = f"""
    You are an AI that introduces imperfections in a note to make it look like a flawed human-made note.
    Modify the following text by adding approximately {imperfection_percentage}% imperfections:
    
    1️⃣ **Make factual errors** - Replace some facts with wrong information.  
    2️⃣ **Random word & sentence deletion** - Remove different words/sentences for each generated note.  
    3️⃣ **Remove large chunks at higher levels** - At {imperfection_percentage}% error, remove whole paragraphs.  
    4️⃣ **Misspell words** - Introduce common typos like 'teh' instead of 'the', 'recieve' instead of 'receive'.  
    5️⃣ **Each generated version should have different imperfections** (No same mistakes across all versions).  

    ### Original Note:
    {note}

    ### Imperfect Note:
    """

    response = openai.chat.completions.create(
        model="gpt-4",  
        messages=[{"role": "user", "content": prompt}],
        temperature=1.2 # Increase randomness
    )

    return response.choices[0].message.content

for level in imperfection_levels:
    imperfect_note = introduce_human_like_imperfections(perfect_note, level)
    filename = f"notes/note_imperfect_{level}.txt"
    
    with open(filename, "w", encoding="utf-8") as file:
        file.write(imperfect_note)

    print(f"Generated: {filename}")

print("All imperfect notes generated successfully!")
