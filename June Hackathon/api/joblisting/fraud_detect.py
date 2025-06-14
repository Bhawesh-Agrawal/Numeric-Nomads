from fastapi import APIRouter, Query
from typing import List
from Services.job_service import fetch_job_data
from Services.fraud_services import predict_fraud_for_job
from models.job_model import Job
from models.fraud_model import JobWithFraud

router = APIRouter()

@router.get("/", response_model=List[JobWithFraud])
async def get_jobs_with_fraud_info(job_title: str = Query(..., description="Job title to search in Adzuna")):
    jobs = await fetch_job_data(job_title)
    jobs_with_fraud = []

    for job in jobs:
        fraud_info = predict_fraud_for_job(job)
        job_dict = job.dict()
        job_dict.update(fraud_info)  # Add fraud result
        jobs_with_fraud.append(JobWithFraud(**job_dict))

    return jobs_with_fraud
