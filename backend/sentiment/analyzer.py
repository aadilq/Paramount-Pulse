from transformers import pipeline

LABEL_MAP = {
    "LABEL_0": "NEGATIVE",
    "LABEL_1": "NEUTRAL",
    "LABEL_2": "POSITIVE",
}

_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        print("[SENTIMENT] Loading HuggingFace model...")
        _pipeline = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment", truncation=True, max_length=512)
        print("[SENTIMENT] Model loaded.")
    return _pipeline

def analyze_batch(texts: list[str]) -> list[dict]:
    pipe = get_pipeline()
    results = pipe(texts, batch_size=8, truncation=True)
    return [
        {
            "label": LABEL_MAP.get(r["label"], r["label"]),
            "score": round(r["score"], 4)
        }
        for r in results
    ]