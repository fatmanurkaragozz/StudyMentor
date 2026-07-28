"""Trains the "will the student get this topic right?" classifier from
assistments_sample_100k.csv.

Dataset: a 100,000-row random sample of the ASSISTments 2009-2010 skill-builder
dataset (real math-tutoring platform logs, Pardos & Heffernan / WPI, 4,217 real
students, 110 real math skills/topics like "Equation Solving Two or Fewer Steps").
Source (two independent, no-auth mirrors, same file confirmed by matching size):
- https://raw.githubusercontent.com/CAHLR/pyBKT-examples/master/data/as.csv
- https://figshare.com/articles/dataset/skill_builder_data_csv/25309000

Given a topic and a student's practice history on it (past repetitions,
attempts, response time, hints used), predicts whether they will answer
correctly right now. A low predicted probability means "review this topic now."

Run manually whenever the dataset changes:
    python train.py

Produces models/priority_model.joblib, loaded by app/model.py at request time.
"""

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
import joblib
from pathlib import Path

DATA_PATH = Path(__file__).parent / "assistments_sample_100k.csv"
MODEL_PATH = Path(__file__).parent / "models" / "priority_model.joblib"

# skill_name = the topic (110 real math skills). No absolute timestamp exists in
# this dataset (only order_id sequence), so hour-of-day is not a feature here -
# a known, accepted gap (see notebooks/spaced_repetition_eda.ipynb history).
NUMERIC_FEATURES = ["opportunity", "attempt_count", "ms_first_response", "overlap_time", "hint_count"]
CATEGORICAL_FEATURES = ["skill_name"]
TARGET = "correct"

# attempt_count/ms_first_response/overlap_time'da gozlemledigimiz gercekci olmayan
# uc degerleri (orn. attempt_count=3740, ms_first_response~8 saat) muhtemelen
# kayit hatasi - bu sutunlari 99. yuzdelikte kirpiyoruz (winsorize) ki birkac
# bozuk satir agac bolme noktalarini carpitmasin.
OUTLIER_CLIP_COLUMNS = ["attempt_count", "ms_first_response", "overlap_time"]
CLIP_PERCENTILE = 0.99


def load_dataset() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    for col in OUTLIER_CLIP_COLUMNS:
        cap = df[col].quantile(CLIP_PERCENTILE)
        df[col] = df[col].clip(upper=cap)
    return df


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ],
        remainder="passthrough",
    )
    model = RandomForestClassifier(n_estimators=300, max_depth=12, random_state=42, class_weight="balanced")
    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def main() -> None:
    df = load_dataset()
    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]

    # Tek bir train/test bolunmesi sansli/sanssiz cikabilir. 5 katli
    # StratifiedKFold ile modeli 5 farkli bolunmede egitip test ederek
    # AUC/accuracy'nin ortalamasini VE standart sapmasini goruyoruz - bu,
    # sonucun rastlantiya mi bagli oldugunu anlamamizi saglar.
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = cross_validate(build_pipeline(), X, y, cv=cv, scoring=["roc_auc", "accuracy"])
    print("=== 5-katli cross-validation ===")
    print(f"AUC:      {cv_results['test_roc_auc'].mean():.3f} (+/- {cv_results['test_roc_auc'].std():.3f})")
    print(f"Accuracy: {cv_results['test_accuracy'].mean():.3f} (+/- {cv_results['test_accuracy'].std():.3f})")
    print()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    probabilities = pipeline.predict_proba(X_test)[:, 1]

    # Sadece accuracy/recall'a değil, precision/recall/F1'in HER İKİ sınıf için de
    # (dogru=1 ve yanlis=0) ayrı ayrı raporuna bakıyoruz - dengesiz olmayan bir
    # veri setinde bile tek bir metrik yanıltıcı olabilir.
    print(classification_report(y_test, predictions, target_names=["yanlis (0)", "dogru (1)"]))
    print("AUC:", round(roc_auc_score(y_test, probabilities), 3))
    print("Confusion matrix (satir=gercek, sutun=tahmin):")
    print(confusion_matrix(y_test, predictions))

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
