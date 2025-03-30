import os
import nltk
import string
import difflib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import words
from nltk.tokenize import word_tokenize

nltk.download("punkt_tab")
nltk.download("words")
nltk.download("punkt")

word_list = set(words.words())

# Load Perfect Note (instead of Super Note)
with open("notes/perfect_note.txt", "r", encoding="utf-8") as file:
    perfect_note = file.read()

# Load Imperfect Notes
imperfect_notes = []
imperfect_files = sorted(
    [f for f in os.listdir("notes") if f.startswith("note_imperfect")],
    key=lambda x: int(x.split("_")[-1].split(".")[0])  # Sort by imperfection level
)

for file in imperfect_files:
    with open(f"notes/{file}", "r", encoding="utf-8") as f:
        imperfect_notes.append((file, f.read()))

vectorizer = TfidfVectorizer()
documents = [perfect_note] + [note for _, note in imperfect_notes]
tfidf_matrix = vectorizer.fit_transform(documents)

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def count_misspellings(text):
    tokens = word_tokenize(text.lower())
    return sum(1 for word in tokens if word not in word_list and word not in string.punctuation)

def missing_chunk_score(perfect_text, imperfect_text):
    """ Calculate missing chunk score where more missing chunks decrease the score more """
    matcher = difflib.SequenceMatcher(None, perfect_text, imperfect_text)
    matched_blocks = sum(block.size for block in matcher.get_matching_blocks())  # Total matched characters
    missing_percentage = 1 - (matched_blocks / len(perfect_text))  # Fraction of text missing
    return round(missing_percentage * 10)  # Scale missing content score (higher % missing -> lower score)

for file_name, imperfect_text in imperfect_notes:
    tfidf_vectors = tfidf_matrix.toarray()
    similarity = cosine_similarity(tfidf_vectors[0], tfidf_vectors[imperfect_notes.index((file_name, imperfect_text)) + 1])
    similarity_score = round(similarity * 10)  # Scale from 0-10

    total_words = len(word_tokenize(imperfect_text))
    misspelled_count = count_misspellings(imperfect_text)
    misspelling_score = round((misspelled_count / total_words) * 10) if total_words > 0 else 10  # Avoid division by zero

    missing_score = missing_chunk_score(perfect_note, imperfect_text)

    factual_error_score = 10 - similarity_score  # Higher difference means more factual errors

    length_diff = abs(len(perfect_note) - len(imperfect_text))
    length_penalty = min(10, round(length_diff / len(perfect_note) * 10))  # Scale from 0-10

    # Final Score (Lower missing chunk percentage gives higher score)
    final_score = ( (similarity_score * 0.3 + (misspelling_score )* 0.1 + (10-missing_score) * 0.3 + (10-factual_error_score) * 0.2 + (10-length_penalty) * 0.1))

    print(f"📄 **{file_name} Score:** {final_score}/10")
    print(f"   🔹 Similarity Score: {similarity_score}/10")
    print(f"   🔹 Misspelling Score: {10-misspelling_score}/10")
    print(f"   🔹 Missing Chunk Score: {10-missing_score}/10")
    print(f"   🔹 Factual Error Score: {10-factual_error_score}/10")
    print(f"   🔹 Length Penalty: {10-length_penalty}/10")
    print("-" * 50)
