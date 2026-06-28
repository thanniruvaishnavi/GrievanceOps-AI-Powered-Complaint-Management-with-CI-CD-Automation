"""
Duplicate ticket detector.

Strategy: maintain a rolling TF-IDF matrix of recently-seen ticket texts
(cached in Redis as "ticket_id -> raw text"), and for each new ticket compute
cosine similarity against that recent window. If similarity exceeds a
threshold, flag it as a likely duplicate of the closest match.

Redis is used here exactly as called out in the architecture: a fast lookup
cache so we don't have to re-query Postgres (or re-vectorize the full ticket
history) on every single new ticket.
"""
import os
from typing import Optional, Tuple

import redis
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models.text_preprocessing import clean_text

SIMILARITY_THRESHOLD = 0.82
RECENT_WINDOW_KEY = "ml:recent_tickets"  # Redis hash: ticket_id -> cleaned text
MAX_WINDOW_SIZE = 500


class DuplicateDetector:
    def __init__(self):
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", "6379"))
        try:
            self.redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
            self.redis_client.ping()
        except Exception:
            self.redis_client = None  # graceful degrade: duplicate detection becomes a no-op

    def check_and_register(self, ticket_id: int, text: str) -> Tuple[bool, Optional[int]]:
        cleaned = clean_text(text)

        if self.redis_client is None:
            return False, None

        existing: dict = self.redis_client.hgetall(RECENT_WINDOW_KEY)
        is_duplicate, match_id = self._find_duplicate(cleaned, existing)

        # Always register this ticket in the recent window for future comparisons
        self.redis_client.hset(RECENT_WINDOW_KEY, str(ticket_id), cleaned)
        if self.redis_client.hlen(RECENT_WINDOW_KEY) > MAX_WINDOW_SIZE:
            oldest_key = next(iter(self.redis_client.hkeys(RECENT_WINDOW_KEY)))
            self.redis_client.hdel(RECENT_WINDOW_KEY, oldest_key)

        return is_duplicate, match_id

    def _find_duplicate(self, cleaned_text: str, existing: dict) -> Tuple[bool, Optional[int]]:
        if not existing:
            return False, None

        ids = list(existing.keys())
        texts = list(existing.values()) + [cleaned_text]

        vectorizer = TfidfVectorizer(stop_words="english")
        try:
            tfidf_matrix = vectorizer.fit_transform(texts)
        except ValueError:
            return False, None  # empty vocabulary edge case

        new_vector = tfidf_matrix[-1]
        existing_vectors = tfidf_matrix[:-1]
        similarities = cosine_similarity(new_vector, existing_vectors).flatten()

        if len(similarities) == 0:
            return False, None

        best_idx = similarities.argmax()
        best_score = similarities[best_idx]

        if best_score >= SIMILARITY_THRESHOLD:
            return True, int(ids[best_idx])
        return False, None


# Singleton instance reused across requests
duplicate_detector = DuplicateDetector()
