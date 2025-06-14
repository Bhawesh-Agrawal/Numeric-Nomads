from fastapi import APIRouter, Query
from typing import List
from Services.job_service import fetch_job_data
from models.job_model import Job

router = APIRouter()

@router.get("/", response_model=List[Job])
async def get_jobs(job_title: str = Query(..., description="Title of the job to search")):
    return await fetch_job_data(job_title)
