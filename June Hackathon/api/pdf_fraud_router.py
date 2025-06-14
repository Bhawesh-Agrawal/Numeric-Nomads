from io import BytesIO
from fastapi import APIRouter, UploadFile, File, HTTPException
from Services.pdf_service import extract_job_info_from_pdf
from Services.fraud_services import predict_fraud_for_extracted_job

router = APIRouter()

@router.post("/fraud-detect/pdf")
async def detect_pdf_fraud(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a PDF.")

    content = await file.read()
    extracted_data = extract_job_info_from_pdf(BytesIO(content))
    fraud_result = predict_fraud_for_extracted_job(extracted_data)

    return {"extracted_data": extracted_data, "fraud_detection": fraud_result}
