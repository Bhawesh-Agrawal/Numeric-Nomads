# api/fraud_detection.py
from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import pandas as pd

router = APIRouter()

# Load the trained pipeline and threshold
model, threshold = joblib.load("D://Programming//June Hackathon//job_fraud_model.pkl")


# 👤 Request schema for incoming fraud check
class JobInput(BaseModel):
    title: str
    description: str
    company_profile: str
    requirements: str
    telecommuting: int  # 0 or 1


# 🎯 Response schema
class FraudPrediction(BaseModel):
    probability: float
    is_fraud: bool


# 📝 Fraud check endpoint
@router.post("/predict", response_model=FraudPrediction)
def predict_fraud(job: JobInput):
    # Prepare the data as dataframe (like you did in preprocess_data)
    data = {
        'title': [job.title],
        'description': [job.description],
        'company_profile': [job.company_profile],
        'requirements': [job.requirements],
        'telecommuting': [job.telecommuting]
    }
    df = pd.DataFrame(data)

    # Create derived features
    df['combined_text'] = df[['title', 'description', 'company_profile', 'requirements']].fillna('').agg(' '.join,
                                                                                                         axis=1)
    df['text_length'] = df['combined_text'].apply(len)
    df['word_count'] = df['combined_text'].apply(lambda x: len(x.split()))

    features = df[['combined_text', 'text_length', 'word_count', 'telecommuting']]

    # Predict probability
    proba = model.predict_proba(features)[:, 1][0]
    is_fraud = proba >= threshold

    return FraudPrediction(probability=proba, is_fraud=is_fraud)
