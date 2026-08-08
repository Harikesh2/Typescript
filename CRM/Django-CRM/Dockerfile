FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for mysqlclient
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Run with gunicorn
CMD ["gunicorn", "dcrm.wsgi:application", "--bind", "0.0.0.0:8000"]
