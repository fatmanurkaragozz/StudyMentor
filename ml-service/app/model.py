"""Loads the trained correctness classifier and maps its output to a priority label."""

from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd

MODEL_PATH = Path(__file__).parent.parent / "models" / "priority_model.joblib"


@lru_cache(maxsize=1)
def get_pipeline():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train.py first.")
    return joblib.load(MODEL_PATH)


def predict_correct_probability(features: dict) -> float:
    pipeline = get_pipeline()
    row = pd.DataFrame([features])
    return float(pipeline.predict_proba(row)[0][1])


def priority_label(correct_probability: float) -> str:
    """Low probability of answering correctly means this topic needs review now."""
    if correct_probability < 0.5:
        return "YUKSEK"
    if correct_probability < 0.8:
        return "ORTA"
    return "DUSUK"
