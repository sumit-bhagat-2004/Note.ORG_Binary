from sklearn.feature_extraction.text import TfidfVectorizer
import pickle

def extract_keywords(text):
    """Extracts the top keywords from the text using TF-IDF"""
    vectorizer = TfidfVectorizer(stop_words='english', max_features=10)
    tfidf_matrix = vectorizer.fit_transform([text])
    keywords = vectorizer.get_feature_names_out()
    
    with open("../models/tfidf.pkl", "wb") as f:
        pickle.dump(vectorizer, f)
    
    return list(keywords)
