from fastapi import FastAPI
from note_loader import load_note
from keyword_extraction import extract_keywords
from web_scraper import scrape_top_sites
from similarity_checker import compare_similarity
from score_calculator import calculate_final_score

app = FastAPI()

@app.get("/analyze/{note_filename}")
def analyze_class_note(note_filename: str):
    """Main API to analyze a class note and assign scores"""
    note_text = load_note(note_filename)
    if not note_text:
        return {"error": "File not found"}

    keywords = extract_keywords(note_text)
    top_sites = scrape_top_sites(" ".join(keywords))

    web_text = " ".join([site for site in top_sites])  # Simulate extracted text
    similarity_score = compare_similarity(note_text, web_text)
    
    final_score = calculate_final_score(note_text, keywords, similarity_score)
    
    return {
        "keywords": keywords,
        "top_sites": top_sites,
        "similarity_score": similarity_score,
        "final_score": final_score
    }

