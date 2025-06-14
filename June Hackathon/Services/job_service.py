import httpx
from models.job_model import Job

API_URL = "https://api.adzuna.com/v1/api/jobs/in/search/1"
APP_ID = "a657a014"        # Replace with your Adzuna APP ID
APP_KEY = "15cc3135b3537f836d00bc642439021a"      # Replace with your Adzuna APP KEY

async def fetch_job_data(job_title: str = "developer"):
    params = {
        "app_id": APP_ID,
        "app_key": APP_KEY,
        "what": job_title,
        "content-type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(API_URL, params=params)
        data = response.json()

    jobs = []
    for item in data.get("results", []):
        job = Job(
            title=item.get("title"),
            salary_min=item.get("salary_min"),
            salary_max=item.get("salary_max"),
            location=item.get("location", {}).get("display_name"),
            department=item.get("category", {}).get("label"),
            company=item.get("company", {}).get("display_name"),
            description=item.get("description"),
            requirements=item.get("description"),
            benefits=None,
            telecommuting=None,
            employment_type=item.get("contract_time"),
            experience=None,
            industry=None,
            function=item.get("category", {}).get("label"),
            redirect_url=item.get("redirect_url")
        )
        jobs.append(job)

    return jobs
