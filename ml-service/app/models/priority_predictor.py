"""
Priority predictor.

Trains a separate TF-IDF + Logistic Regression model to predict ticket
priority (LOW / MEDIUM / HIGH / CRITICAL) directly from ticket text, then
nudges the prediction using rule-based signals (urgency keywords, sentiment)
the way a real production model would be wrapped with business rules.
"""
import os
import re

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from app.models.text_preprocessing import clean_text

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "data", "training_tickets.csv")
MODEL_PATH = os.path.join(BASE_DIR, "data", "priority_model.joblib")

PRIORITY_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

URGENT_KEYWORDS = re.compile(
    r"\b(urgent|asap|immediately|critical|down|outage|hacked|security breach|"
    r"data loss|cannot access|emergency)\b",
    re.IGNORECASE,
)


class PriorityPredictor:
    def __init__(self):
        self.pipeline: Pipeline | None = None
        self._load_or_train()

    def _load_or_train(self):
        if os.path.exists(MODEL_PATH):
            self.pipeline = joblib.load(MODEL_PATH)
            return
        self.train()

    def train(self):
        df = pd.read_csv(DATA_PATH)
        df["clean_text"] = df["text"].apply(clean_text)

        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words="english")),
            ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ])
        self.pipeline.fit(df["clean_text"], df["priority"])
        joblib.dump(self.pipeline, MODEL_PATH)

    def predict(self, text: str, sentiment_score: float = 0.0) -> str:
        cleaned = clean_text(text)
        base_prediction = self.pipeline.predict([cleaned])[0]

        bumped = self._apply_business_rules(text, base_prediction, sentiment_score)
        return bumped

    def _apply_business_rules(self, raw_text: str, base_prediction: str, sentiment_score: float) -> str:
        idx = PRIORITY_ORDER.index(base_prediction)

        # Escalate one level if urgent keywords are present
        if URGENT_KEYWORDS.search(raw_text):
            idx = min(idx + 1, len(PRIORITY_ORDER) - 1)

        # Escalate one level if the customer is clearly very upset
        if sentiment_score <= -0.6:
            idx = min(idx + 1, len(PRIORITY_ORDER) - 1)

        return PRIORITY_ORDER[idx]


# Singleton instance reused across requests
priority_predictor = PriorityPredictor()
