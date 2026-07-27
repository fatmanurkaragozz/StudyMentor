from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Literal

from app.model import predict_productivity, priority_label

router = APIRouter()


class StudySessionFeatures(BaseModel):
    duration_minutes: int = Field(gt=0)
    difficulty_rating: int = Field(ge=1, le=5)
    days_since_last_study: int = Field(ge=0)
    habit_streak_days: int = Field(ge=0)
    user_mode: Literal["STUDENT", "LIFELONG_LEARNER"]
    subject_or_project: str


class PriorityPrediction(BaseModel):
    predicted_productivity: float
    priority: Literal["YUKSEK", "ORTA", "DUSUK"]


@router.post("/predict/priority", response_model=PriorityPrediction)
def predict_priority(features: StudySessionFeatures) -> PriorityPrediction:
    predicted_productivity = predict_productivity(features.model_dump())
    priority = priority_label(predicted_productivity, features.difficulty_rating)
    return PriorityPrediction(predicted_productivity=round(predicted_productivity, 2), priority=priority)
