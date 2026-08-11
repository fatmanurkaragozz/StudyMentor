from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Literal

from app.model import predict_correct_probability, priority_label

router = APIRouter()


class TopicPracticeFeatures(BaseModel):
    opportunity: int = Field(ge=1, description="Which repetition this is for this topic")
    attempt_count: int = Field(ge=0, description="Attempts made on this specific problem")
    ms_first_response: float = Field(ge=0, description="Milliseconds to first response")
    overlap_time: float = Field(ge=0, description="Total milliseconds spent on the problem, including hints")
    hint_count: int = Field(ge=0, description="Hints requested on this problem")


class PriorityPrediction(BaseModel):
    correct_probability: float
    priority: Literal["YUKSEK", "ORTA", "DUSUK"]


@router.post("/predict/priority", response_model=PriorityPrediction)
def predict_priority(features: TopicPracticeFeatures) -> PriorityPrediction:
    correct_probability = predict_correct_probability(features.model_dump())
    return PriorityPrediction(
        correct_probability=round(correct_probability, 3),
        priority=priority_label(correct_probability),
    )
