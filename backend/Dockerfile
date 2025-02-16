# Use official Python image as a base
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy the application code
COPY . .

# Set PYTHONPATH to include `/app`
ENV PYTHONPATH=/app

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 8000
EXPOSE 8000

# Run the FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
