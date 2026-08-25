"""Exports StudyMentor's own usage data out of Postgres for future retraining.

Read-only - does NOT touch train.py or priority_model.joblib. train.py still
trains on assistments_sample_100k.csv; this script just makes real StudyMentor
data available in the same shape, so once enough volume has accumulated a
future training run can use (or blend in) real usage instead of only the
third-party ASSISTments dataset.

Exports two files:
- studymentor_export.csv: completed TopicCheck rows, in the exact column shape
  train.py expects (opportunity/attempt_count/ms_first_response/overlap_time/
  hint_count/correct), plus an education_level snapshot column for future
  mode/persona segmentation.
- studymentor_insight_export.jsonl: SubjectInsightLog rows (prompt + generated
  content + user feedback) for future LLM-side evaluation/fine-tuning work.

Reads the Postgres connection string from backend/.env (DIRECT_URL, falling
back to DATABASE_URL) - the same database the backend/Prisma writes to.

Run manually:
    python export_training_data.py
"""

import csv
import json
from pathlib import Path

import psycopg2
from dotenv import dotenv_values

BACKEND_ENV_PATH = Path(__file__).parent.parent / "backend" / ".env"
TOPIC_CHECK_OUTPUT_PATH = Path(__file__).parent / "studymentor_export.csv"
INSIGHT_OUTPUT_PATH = Path(__file__).parent / "studymentor_insight_export.jsonl"

TOPIC_CHECK_QUERY = """
    SELECT "opportunity", "attemptCount", "msFirstResponse", "overlapTimeMs",
           "hintCount", "selfGradedCorrect", "educationLevel"
    FROM "TopicCheck"
    WHERE "submittedAt" IS NOT NULL
"""

SUBJECT_INSIGHT_LOG_QUERY = """
    SELECT id, "userId", "subjectId", "systemPrompt", "userPrompt", content,
           feedback, "feedbackReason", "createdAt"
    FROM "SubjectInsightLog"
"""


def get_connection_string() -> str:
    env = dotenv_values(BACKEND_ENV_PATH)
    url = env.get("DIRECT_URL") or env.get("DATABASE_URL")
    if not url:
        raise RuntimeError(f"DIRECT_URL/DATABASE_URL bulunamadi ({BACKEND_ENV_PATH})")
    return url


def export_topic_checks(conn) -> int:
    with conn.cursor() as cur:
        cur.execute(TOPIC_CHECK_QUERY)
        rows = cur.fetchall()

    with TOPIC_CHECK_OUTPUT_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            ["opportunity", "attempt_count", "ms_first_response", "overlap_time", "hint_count", "correct", "education_level"]
        )
        for opportunity, attempt_count, ms_first_response, overlap_time, hint_count, self_graded_correct, education_level in rows:
            writer.writerow(
                [opportunity, attempt_count, ms_first_response, overlap_time, hint_count, int(self_graded_correct), education_level or ""]
            )
    return len(rows)


def export_subject_insight_logs(conn) -> int:
    with conn.cursor() as cur:
        cur.execute(SUBJECT_INSIGHT_LOG_QUERY)
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]

    with INSIGHT_OUTPUT_PATH.open("w", encoding="utf-8") as f:
        for row in rows:
            record = dict(zip(columns, row))
            record["createdAt"] = record["createdAt"].isoformat()
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    return len(rows)


def main() -> None:
    conn = psycopg2.connect(get_connection_string())
    try:
        check_count = export_topic_checks(conn)
        log_count = export_subject_insight_logs(conn)
    finally:
        conn.close()
    print(f"{check_count} TopicCheck satiri -> {TOPIC_CHECK_OUTPUT_PATH}")
    print(f"{log_count} SubjectInsightLog satiri -> {INSIGHT_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
