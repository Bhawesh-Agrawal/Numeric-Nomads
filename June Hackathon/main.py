from fastapi import FastAPI
from api.joblisting.joblisting import router as jobs_router
from api.joblisting.fraud_detect import router as fraud_detect_router
from api.fraud_detection import router as fraud_check_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev use "*" or ["http://localhost:3000"] for production
    allow_credentials=True,
    allow_methods=["*"],  # allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # allows all headers including 'Content-Type'
)

app.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
app.include_router(fraud_detect_router, prefix="/jobs/fraud_detect", tags=["Jobs with Fraud Detection"])
app.include_router(fraud_check_router, prefix="/fraud", tags=["Manual Fraud Check"])  # 🟢
