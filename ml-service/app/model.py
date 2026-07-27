"""Loads the trained productivity model and turns its output into a priority label."""

from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd

MODEL_PATH = Path(__file__).parent.parent / "models" / "productivity_model.joblib"


@lru_cache(maxsize=1)
def get_pipeline():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train.py first.")
    return joblib.load(MODEL_PATH)


def predict_productivity(features: dict) -> float:
    pipeline = get_pipeline()
    row = pd.DataFrame([features])
    prediction = pipeline.predict(row)[0]
    return float(prediction)


def priority_label(predicted_productivity: float, difficulty_rating: int) -> str:
    """Low predicted productivity combined with high difficulty means this topic needs attention first."""
    if predicted_productivity <= 2.5 and difficulty_rating >= 4:
        return "YUKSEK"
    if predicted_productivity <= 3.5:
        return "ORTA"
    return "DUSUK"
