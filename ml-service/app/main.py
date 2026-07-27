from fastapi import FastAPI

from app.predict import router as predict_router

app = FastAPI(title="StudyMentor ML Service")

app.include_router(predict_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
