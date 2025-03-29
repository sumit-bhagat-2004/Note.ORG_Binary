from sentence_transformers import SentenceTransformer, util

bert_model = SentenceTransformer('all-MiniLM-L6-v2')

def compare_similarity(note_text, web_text):
    """Compares note content with scraped web content using BERT"""
    embeddings1 = bert_model.encode(note_text, convert_to_tensor=True)
    embeddings2 = bert_model.encode(web_text, convert_to_tensor=True)
    
    similarity_score = util.pytorch_cos_sim(embeddings1, embeddings2).item()
    return round(similarity_score * 7, 2) 
