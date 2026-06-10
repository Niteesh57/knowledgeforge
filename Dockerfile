# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve Backend & Frontend
FROM python:3.10-slim AS runner
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Install requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy source code
COPY backend/ ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
