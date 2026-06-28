"""
Sentiment analyzer.

Uses NLTK's VADER lexicon-based sentiment analyzer, which is well-suited to
short, informal customer-support text (handles negation, intensifiers, and
punctuation emphasis like "!!!" out of the box) without needing a training set.
Falls back to a tiny hand-rolled lexicon if NLTK data isn't available
(e.g. offline CI runners), so the service never hard-fails on missing data.
"""
import nltk

_POSITIVE_WORDS = {
    "great", "thanks", "thank", "good", "excellent", "awesome", "love",
    "helpful", "resolved", "fast", "perfect", "appreciate",
}
_NEGATIVE_WORDS = {
    "bad", "terrible", "worst", "hate", "broken", "useless", "frustrated",
    "frustrating", "angry", "disappointed", "crash", "crashes", "down",
    "never", "horrible", "awful", "annoyed", "unacceptable",
}


class SentimentAnalyzer:
    def __init__(self):
        self._vader = None
        try:
            nltk.data.find("sentiment/vader_lexicon.zip")
            self._init_vader()
        except LookupError:
            try:
                nltk.download("vader_lexicon", quiet=True)
                self._init_vader()
            except Exception:
                self._vader = None  # fall back to lexicon-lite scorer

    def _init_vader(self):
        from nltk.sentiment import SentimentIntensityAnalyzer
        self._vader = SentimentIntensityAnalyzer()

    def score(self, text: str) -> float:
        """Returns a compound sentiment score from -1 (very negative) to +1 (very positive)."""
        if self._vader is not None:
            return float(self._vader.polarity_scores(text)["compound"])
        return self._fallback_score(text)

    def _fallback_score(self, text: str) -> float:
        words = text.lower().split()
        if not words:
            return 0.0
        pos = sum(1 for w in words if w.strip(".,!?") in _POSITIVE_WORDS)
        neg = sum(1 for w in words if w.strip(".,!?") in _NEGATIVE_WORDS)
        if pos == 0 and neg == 0:
            return 0.0
        return (pos - neg) / max(pos + neg, 1)


# Singleton instance reused across requests
sentiment_analyzer = SentimentAnalyzer()
