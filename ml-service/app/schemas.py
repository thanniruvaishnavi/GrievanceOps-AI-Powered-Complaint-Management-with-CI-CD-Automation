from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AnalyzeRequest(BaseModel):
    ticket_id: int
    subject: str
    description: str


class AnalyzeResponse(BaseModel):
    category: str
    priority: str
    sentiment_score: float = Field(..., alias="sentimentScore")
    is_duplicate: bool = Field(..., alias="isDuplicate")
    duplicate_of_ticket_id: Optional[int] = Field(None, alias="duplicateOfTicketId")
    embedding: Optional[List[float]] = None

    model_config = ConfigDict(populate_by_name=True)


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
