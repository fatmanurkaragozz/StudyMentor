"""Trains the study-productivity/priority model from studymentor_dataset.csv.

Run manually whenever the dataset changes:
    python train.py

Produces models/productivity_model.joblib, loaded by app/model.py at request time.
"""

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
import joblib
from pathlib import Path

DATA_PATH = Path(__file__).parent / "studymentor_dataset.csv"
MODEL_PATH = Path(__file__).parent / "models" / "productivity_model.joblib"

NUMERIC_FEATURES = ["duration_minutes", "difficulty_rating", "days_since_last_study", "habit_streak_days"]
CATEGORICAL_FEATURES = ["user_mode", "subject_or_project"]
TARGET = "productivity_rating"


def load_dataset() -> pd.DataFrame:
    return pd.read_csv(DATA_PATH)


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ],
        remainder="passthrough",
    )
    model = RandomForestRegressor(n_estimators=200, max_depth=8, random_state=42)
    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def main() -> None:
    df = load_dataset()
    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    print(f"Test MAE: {mae:.3f} (productivity_rating is 1-5)")
    print(f"Test R^2: {r2:.3f}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
