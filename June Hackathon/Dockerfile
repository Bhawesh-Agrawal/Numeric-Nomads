# Use official lightweight Python image
FROM python:3.12-slim

# Install system dependencies: poppler-utils for pdf2image + others
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    poppler-utils \
    gcc \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy your FastAPI app code to container
COPY . .

# Expose port 8000 for FastAPI
EXPOSE 8000

# Command to run the FastAPI app via Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
