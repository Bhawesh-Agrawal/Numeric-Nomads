import pandas as pd
from models.job_model import Job
from api.fraud_detection import model, threshold

def predict_fraud_for_job(job: Job):
    """
    Predict fraud for Job objects (Adzuna API jobs).
    """
    data = {
        'title': [job.title or ""],
        'description': [job.description or ""],
        'company_profile': [job.company or ""],  # Using company name
        'requirements': [job.requirements or ""],
        'telecommuting': [0],
        'url': [job.redirect_url or ""]  # Not used in model but kept for completeness
    }
    df = pd.DataFrame(data)

    # Same preprocessing as during training
    df['combined_text'] = df[['title', 'description', 'company_profile', 'requirements']].agg(' '.join, axis=1)
    df['text_length'] = df['combined_text'].apply(len)
    df['word_count'] = df['combined_text'].apply(lambda x: len(x.split()))
    features = df[['combined_text', 'text_length', 'word_count', 'telecommuting']]

    proba = model.predict_proba(features)[:, 1][0]
    is_fraud = proba >= threshold

    return {"fraud_probability": float(proba), "is_fraud": bool(is_fraud)}


def predict_fraud_for_extracted_job(data: dict):
    """
    Predict fraud for extracted PDF job data (dictionary form).
    """
    df = pd.DataFrame([{
        'title': data.get('title', ''),
        'description': data.get('description', ''),
        'company_profile': data.get('company_profile', ''),
        'requirements': data.get('requirements', ''),
        'telecommuting': 0  # Assume 0 for PDF jobs
    }])

    df['combined_text'] = df[['title', 'description', 'company_profile', 'requirements']].agg(' '.join, axis=1)
    df['text_length'] = df['combined_text'].apply(len)
    df['word_count'] = df['combined_text'].apply(lambda x: len(x.split()))
    features = df[['combined_text', 'text_length', 'word_count', 'telecommuting']]

    proba = model.predict_proba(features)[:, 1][0]
    is_fraud = proba >= threshold

    return {"fraud_probability": float(proba), "is_fraud": bool(is_fraud)}
