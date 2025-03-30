from flask import Flask, request, render_template
from PIL import Image
from pix2tex.cli import LatexOCR
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize the LatexOCR model
model = LatexOCR()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file part", 400
    file = request.files['file']
    if file.filename == '':
        return "No selected file", 400
    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        
        # Process the image
        img = Image.open(filepath)
        latex_output = model(img)
        
        # Return the LaTeX output
        return render_template('result.html', latex_output=latex_output)

if __name__ == '__main__':
    app.run(debug=True)