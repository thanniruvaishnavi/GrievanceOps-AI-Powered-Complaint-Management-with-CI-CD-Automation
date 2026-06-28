from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.category_classifier import category_classifier
from app.models.priority_predictor import priority_predictor
from app.models.sentiment_analyzer import sentiment_analyzer
from app.models.duplicate_detector import duplicate_detector
from app.schemas import AnalyzeRequest, AnalyzeResponse, HealthResponse

app = FastAPI(
    title="Smart Support SaaS - ML Service",
    description="TF-IDF category classification, priority prediction, sentiment analysis, and duplicate detection for support tickets.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(status="ok", models_loaded=True)


@app.post("/api/v1/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
def analyze_ticket(request: AnalyzeRequest):
    """
    Full ML pipeline for a newly-created ticket:
      1. Classify category (TF-IDF + Naive Bayes)
      2. Predict priority (TF-IDF + Logistic Regression + business rules)
      3. Score sentiment (VADER lexicon-based)
      4. Check for duplicates against a recent-ticket Redis window (TF-IDF cosine similarity)
    """
    full_text = f"{request.subject}. {request.description}"

    try:
        category = category_classifier.predict(full_text)
        sentiment = sentiment_analyzer.score(full_text)
        priority = priority_predictor.predict(full_text, sentiment_score=sentiment)
        is_duplicate, duplicate_of = duplicate_detector.check_and_register(request.ticket_id, full_text)

        return AnalyzeResponse(
            category=category,
            priority=priority,
            sentimentScore=round(sentiment, 4),
            isDuplicate=is_duplicate,
            duplicateOfTicketId=duplicate_of,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"ML analysis failed: {exc}") from exc


@app.get("/api/v1/category/probabilities", tags=["Analysis"])
def category_probabilities(text: str):
    """Debug/demo endpoint: shows the full probability distribution across categories."""
    return category_classifier.predict_proba(text)
