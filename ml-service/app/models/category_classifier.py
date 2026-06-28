"""
Category classifier.

Trains a TF-IDF vectorizer + Multinomial Naive Bayes classifier on the seed
ticket dataset to predict a support category (LOGIN_BUG, BILLING, OUTAGE...).
Model artifacts are cached to disk so the service doesn't retrain on every
container restart.
"""
import os

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

from app.models.text_preprocessing import clean_text

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_PATH = os.path.join(BASE_DIR, "data", "training_tickets.csv")
MODEL_PATH = os.path.join(BASE_DIR, "data", "category_model.joblib")


class CategoryClassifier:
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
            ("clf", MultinomialNB(alpha=0.3)),
        ])
        self.pipeline.fit(df["clean_text"], df["category"])
        joblib.dump(self.pipeline, MODEL_PATH)

    def predict(self, text: str) -> str:
        cleaned = clean_text(text)
        return self.pipeline.predict([cleaned])[0]

    def predict_proba(self, text: str) -> dict:
        cleaned = clean_text(text)
        probs = self.pipeline.predict_proba([cleaned])[0]
        classes = self.pipeline.named_steps["clf"].classes_
        return dict(zip(classes, probs.tolist()))


# Singleton instance reused across requests
category_classifier = CategoryClassifier()
