def calculate_final_score(note_text, keywords, similarity_score):
    """Calculates a final score based on text length, keyword density, and relevance"""
    length_score = min(len(note_text) / 500, 3) 
    keyword_score = min(len(keywords) / 5, 2)   
    return round(length_score + keyword_score + similarity_score, 2)
