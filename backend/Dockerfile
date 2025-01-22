# Backend Dockerfile
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the Flask port
EXPOSE 5000

# Run the application
# Initialize database, run migrations, and start the app
CMD ["sh", "-c", "flask db upgrade && flask run --host=0.0.0.0 --port=$FLASK_RUN_PORT"]