from flask import Flask, jsonify
import json

app = Flask(__name__)

@app.route('/notes', methods=['POST'])
def get_notes():
    """API to fetch AI-generated notes."""
    try:
        with open("generated_notes.json", "r", encoding="utf-8") as file:
            notes = json.load(file)
        return jsonify(notes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
