import joblib
import re
import math
from flask import Flask, request, jsonify

app = Flask(__name__)

model = joblib.load("lr_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

DOMAIN_KEYWORDS = [
    "graphics", "gameplay", "story", "mechanics", "bugs",
    "performance", "fps", "soundtrack", "combat", "optimization"
]


def apply_rules(text: str, rating: int, base_prob: float) -> dict:
    words = text.split()
    word_count = len(words)

    if word_count < 3:
        return {"label": "NOT HELPFUL", "score": 100.0}

    if rating <= 2:
        threshold = 0.70
    elif rating == 3:
        threshold = 0.50
    else:
        threshold = 0.45

    text_lower = text.lower()
    found = sum(
        1 for kw in DOMAIN_KEYWORDS
        if re.search(r'\b' + kw + r'\b', text_lower)
    )

    prob = base_prob
    if word_count > 30 and found >= 2:
        prob = min(prob + 0.15, 1.0)
    elif word_count < 10:
        prob = max(prob - 0.15, 0.0)

    if prob >= threshold:
        confidence = 50.0 + ((prob - threshold) / (1.0 - threshold)) * 50.0
        return {"label": "HELPFUL", "score": round(confidence, 2)}
    else:
        confidence = 50.0 + ((threshold - prob) / threshold) * 50.0
        return {"label": "NOT HELPFUL", "score": round(confidence, 2)}


@app.route("/classify", methods=["POST"])
def classify():
    data = request.get_json(force=True)
    text = data.get("text", "")
    rating = int(data.get("rating", 3))

    if not text:
        return jsonify({"label": "NOT HELPFUL", "score": 100.0})

    features = vectorizer.transform([text])
    proba = model.predict_proba(features)[0]

    classes = list(model.classes_)
    helpful_idx = classes.index(1) if 1 in classes else (classes.index("1") if "1" in classes else -1)

    if helpful_idx >= 0:
        base_prob = float(proba[helpful_idx])
    else:
        base_prob = float(max(proba))

    if features.nnz == 0:
        base_prob = min(base_prob, 0.20)

    result = apply_rules(text, rating, base_prob)
    return jsonify(result)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
