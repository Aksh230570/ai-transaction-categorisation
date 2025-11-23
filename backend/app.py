from fastapi import FastAPI
from pydantic import BaseModel
import yaml
import re
import uvicorn  
import csv
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Transaction Categorisation API")

# ✅ CORS so React can communicate safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load taxonomy from YAML file
with open("taxonomy.yaml", "r", encoding="utf-8") as f:
    taxonomy = yaml.safe_load(f)

CATEGORIES = taxonomy["categories"]

class Transaction(BaseModel):
    text: str

@app.post("/predict")
def predict_category(data: Transaction):
    text = data.text.lower()
    scores = []

    for category in CATEGORIES:
        name = category["name"]
        keywords = category.get("keywords", [])

        matched = [kw for kw in keywords if re.search(r"\b" + re.escape(kw) + r"\b", text)]
        score = len(matched)

        scores.append({
            "category": name,
            "score": score,
            "matched_keywords": matched
        })

    best = max(scores, key=lambda x: x["score"])

    if best["score"] == 0:
        return {
            "category": "Other",
            "confidence": 0.25,
            "explanation": []
        }

    confidence = round(min(0.99, 0.4 + (best["score"] / 5)), 2)

    return {
        "category": best["category"],
        "confidence": confidence,
        "explanation": best["matched_keywords"]
    }


# ✅ FEEDBACK MODEL
class Feedback(BaseModel):
    text: str
    predicted_category: str
    correct_category: str


# ✅ SAVE FEEDBACK TO CSV
@app.post("/feedback")
def save_feedback(data: Feedback):

    file_exists = os.path.isfile("feedback.csv")

    with open("feedback.csv", mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        if not file_exists:
            writer.writerow(["text", "predicted_category", "correct_category"])

        writer.writerow([data.text, data.predicted_category, data.correct_category])

    return {"message": "✅ Feedback received — thank you!"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
