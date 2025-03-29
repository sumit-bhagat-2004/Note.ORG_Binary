import json
import os

DATA_PATH = "../data/"

def load_note(note_filename):
    """Load a class note from the JSON file"""
    file_path = os.path.join(DATA_PATH, note_filename)
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data.get("content", "")
    except FileNotFoundError:
        print(f"File {note_filename} not found.")
        return ""
    except json.JSONDecodeError:
        print(f"Error decoding JSON from file {note_filename}.")