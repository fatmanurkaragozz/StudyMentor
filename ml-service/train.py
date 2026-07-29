"""Trains the "will the student get this topic right?" XGBoost classifier from
assistments_sample_100k.csv.

XGBoost was chosen over Decision Tree / Logistic Regression / Random Forest after
a head-to-head comparison in notebooks/spaced_repetition_eda.ipynb (test AUC 0.967
for XGBoost vs 0.958 for Random Forest, the next best).

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
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBClassifier
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


def build_pipeline(scale_pos_weight: float) -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ],
        remainder="passthrough",
    )
    # XGBoost (boosting): notebook karsilastirmasinda Decision Tree (0.944),
    # Logistic Regression (0.915) ve Random Forest'i (0.958) geride birakip
    # en yuksek AUC'yi (0.967) verdi, o yuzden uretim modeli olarak secildi.
    # scale_pos_weight, class_weight="balanced"'in XGBoost karsiligi -
    # dogru/yanlis sinif dengesizligini (%69.5/%30.5) dengeler.
    model = XGBClassifier(
        n_estimators=300, max_depth=6, learning_rate=0.1,
        scale_pos_weight=scale_pos_weight, random_state=42, eval_metric="logloss",
    )
    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def evaluate(pipeline: Pipeline, X, y, label: str) -> None:
    predictions = pipeline.predict(X)
    probabilities = pipeline.predict_proba(X)[:, 1]
    print(f"=== {label} ===")
    print(classification_report(y, predictions, target_names=["yanlis (0)", "dogru (1)"]))
    print("AUC:", round(roc_auc_score(y, probabilities), 3))
    print("Confusion matrix (satir=gercek, sutun=tahmin):")
    print(confusion_matrix(y, predictions))
    print()


def main() -> None:
    df = load_dataset()
    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]

    # Tek bir train/test bolunmesi sansli/sanssiz cikabilir. 5 katli
    # StratifiedKFold ile modeli 5 farkli bolunmede egitip test ederek
    # AUC/accuracy'nin ortalamasini VE standart sapmasini goruyoruz - bu,
    # sonucun rastlantiya mi bagli oldugunu anlamamizi saglar.
    global_scale_pos_weight = (y == 0).sum() / (y == 1).sum()
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = cross_validate(
        build_pipeline(global_scale_pos_weight), X, y, cv=cv, scoring=["roc_auc", "accuracy"]
    )
    print("=== 5-katli cross-validation (tum veri uzerinde) ===")
    print(f"AUC:      {cv_results['test_roc_auc'].mean():.3f} (+/- {cv_results['test_roc_auc'].std():.3f})")
    print(f"Accuracy: {cv_results['test_accuracy'].mean():.3f} (+/- {cv_results['test_accuracy'].std():.3f})")
    print()

    # Mentorun istedigi %70 egitim / %15 dogrulama / %15 test bolunmesi.
    # Tek train_test_split cagrisi ile uc parcaya bolunemiyor, o yuzden iki
    # asamada yapiyoruz: once %15'i test olarak ayiriyoruz (kalan %85 =
    # egitim+dogrulama), sonra kalan %85'in icinden 15/85 orani alarak
    # dogrulama setini (toplamin %15'i) cikariyoruz. Ikisi de stratify=y ile
    # yapiliyor ki dogru/yanlis orani her parcada orijinal veriyle ayni kalsin.
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.15 / 0.85, random_state=42, stratify=y_train_val
    )
    print(f"Egitim:     {len(X_train):>6} satir (%{100 * len(X_train) / len(X):.0f})")
    print(f"Dogrulama:  {len(X_val):>6} satir (%{100 * len(X_val) / len(X):.0f})")
    print(f"Test:       {len(X_test):>6} satir (%{100 * len(X_test) / len(X):.0f})")
    print()

    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    pipeline = build_pipeline(scale_pos_weight)
    pipeline.fit(X_train, y_train)

    # Dogrulama seti: gelistirme sirasinda modelin/hiperparametrelerin
    # gorulmemis veride nasil davrandigini kontrol etmek icin kullanilir.
    evaluate(pipeline, X_val, y_val, "Dogrulama (validation) sonuclari")

    # Test seti: SADECE en sonda, bir kez, nihai/tarafsiz performansi
    # raporlamak icin kullanilir - modeli veya ayarlari test setine gore
    # degistirmiyoruz (aksi halde test seti de dogrulama setine donusur).
    evaluate(pipeline, X_test, y_test, "Test sonuclari (nihai, tarafsiz degerlendirme)")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
