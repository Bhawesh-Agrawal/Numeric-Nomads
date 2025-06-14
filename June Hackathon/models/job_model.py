from pydantic import BaseModel
from typing import Optional

class Job(BaseModel):
    title: Optional[str]
    salary_min: Optional[float]
    salary_max: Optional[float]
    location: Optional[str]
    department: Optional[str]
    company: Optional[str]
    description: Optional[str]
    requirements: Optional[str]
    benefits: Optional[str]
    telecommuting: Optional[bool]
    employment_type: Optional[str]
    experience: Optional[str]
    industry: Optional[str]
    function: Optional[str]
    redirect_url: Optional[str]
