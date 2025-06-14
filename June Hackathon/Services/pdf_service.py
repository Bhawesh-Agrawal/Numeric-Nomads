import torch
from transformers import DonutProcessor, VisionEncoderDecoderModel
from PIL import Image
from io import BytesIO
import fitz  # PyMuPDF

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Donut Processor and Model (DocVQA fine-tuned)
processor = DonutProcessor.from_pretrained("nielsr/donut-base-finetuned-docvqa")
model = VisionEncoderDecoderModel.from_pretrained("nielsr/donut-base-finetuned-docvqa")

def extract_job_info_from_pdf(file: BytesIO):
    # Read PDF via PyMuPDF
    pdf_document = fitz.open(stream=file.read(), filetype="pdf")
    first_page = pdf_document[0]

    # Convert first page to image
    pix = first_page.get_pixmap()
    img_bytes = pix.tobytes("png")
    image = Image.open(BytesIO(img_bytes)).convert("RGB")

    # Prepare for Donut
    pixel_values = processor(images=image, return_tensors="pt").pixel_values
    task_prompt = "<s_docvqa><s_question>extract job info</s_question><s_answer>"

    outputs = model.generate(
        pixel_values,
        decoder_input_ids=processor.tokenizer(task_prompt, add_special_tokens=False, return_tensors="pt").input_ids,
        max_length=512,
        early_stopping=True
    )

    result_text = processor.batch_decode(outputs, skip_special_tokens=True)[0]

    logger.info(f"Donut Output: {result_text}")

    # Naive parsing - update this based on Donut output structure
    extracted_data = {
        "title": "",
        "description": "",
        "company_profile": "",
        "requirements": ""
    }

    for line in result_text.split('\n'):
        line = line.strip()
        if line.lower().startswith("title"):
            extracted_data["title"] = line.split(":", 1)[1].strip() if ":" in line else ""
        elif line.lower().startswith("description"):
            extracted_data["description"] = line.split(":", 1)[1].strip() if ":" in line else ""
        elif line.lower().startswith("company"):
            extracted_data["company_profile"] = line.split(":", 1)[1].strip() if ":" in line else ""
        elif line.lower().startswith("requirement"):
            extracted_data["requirements"] = line.split(":", 1)[1].strip() if ":" in line else ""

    return extracted_data
