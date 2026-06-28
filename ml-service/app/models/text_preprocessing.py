"""Shared text-cleaning utilities used by every TF-IDF based model."""
import re

_WHITESPACE_RE = re.compile(r"\s+")
_NON_ALPHA_RE = re.compile(r"[^a-zA-Z\s]")


def clean_text(text: str) -> str:
    text = text.lower()
    text = _NON_ALPHA_RE.sub(" ", text)
    text = _WHITESPACE_RE.sub(" ", text).strip()
    return text
