# Use Python 3.10 as base image
FROM python:3.10-slim

# Set working directory
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    git \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY custombot/requirements.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY custombot /code/custombot

# Set environment variables
ENV PYTHONPATH=/code
ENV PORT=7860

# Create necessary directories
RUN mkdir -p /code/custombot/bots
RUN mkdir -p /code/custombot/data
RUN mkdir -p /code/custombot/static
RUN mkdir -p /code/custombot/templates

# Make port 7860 available (Hugging Face Spaces default port)
EXPOSE 7860

# Set the entrypoint command
CMD ["python", "custombot/run.py"]