"""Loads the trained correctness classifier and maps its output to a priority label."""

from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd

MODEL_PATH = Path(__file__).parent.parent / "models" / "priority_model.joblib"


@lru_cache(maxsize=1)
def get_bundle() -> dict:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train.py first.")
    return joblib.load(MODEL_PATH)


def predict_correct_probability(features: dict) -> float:
    bundle = get_bundle()
    # train.py, egitimde uc degerleri (orn. cok uzun bir calisma suresi) 99.
    # yuzdelikte kirpiyordu (winsorize). Gercek istekler bu sinirlarin disina
    # rahatlikla cikabiliyor (orn. 25 dakikalik bir Pomodoro oturumu, egitim
    # verisindeki "bir soruya harcanan sure" kavramindan cok daha uzun) - ayni
    # sinirlari burada da uygulamazsak model hic gormedigi bir bolgede
    # ekstrapolasyon yapip anlamsiz (genelde asiri dusuk) olasiliklar uretiyor.
    clipped = dict(features)
    for column, cap in bundle["clip_caps"].items():
        if column in clipped:
            clipped[column] = min(clipped[column], cap)
    row = pd.DataFrame([clipped])
    return float(bundle["model"].predict_proba(row)[0][1])


def priority_label(correct_probability: float) -> str:
    """Low probability of answering correctly means this topic needs review now."""
    if correct_probability < 0.5:
        return "YUKSEK"
    if correct_probability < 0.8:
        return "ORTA"
    return "DUSUK"
