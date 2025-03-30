import json
import re
import os

def extract_title_and_note(json_file):
    """
    Extracts titles and note content from a JSON file and saves them as .txt files.
    """
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):  
        print("Error: Expected a list in the JSON file.")
        return

    output_dir = "notes/"
    os.makedirs(output_dir, exist_ok=True)  # Ensure the directory exists

    for note in data:
        if not isinstance(note, dict):  
            continue  

        title = note.get("title", "Untitled").strip()
        note_content = note.get("content", "").strip()

        safe_title = re.sub(r'[<>:"/\\|?*]', '', title).replace(" ", "_")

        output_file = f"{output_dir}perfect_note.txt" #{output_dir}{safe_title}

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(note_content)

        print(f"✅ Saved: {output_file}")

if __name__ == "__main__":
    extract_title_and_note("generated_notes.json")
