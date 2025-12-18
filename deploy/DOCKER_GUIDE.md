# Docker Deployment Guide

1. **Build and Run with Docker Compose** (Recommended):
   ```bash
   docker-compose up -d --build
   ```
   This will:
   - Build the image.
   - Start the container on port 80.
   - Mount a `./data` volume to persist your `review.db`.

2. **Update Application**:
   When you change code, just run:
   ```bash
   docker-compose up -d --build
   ```
   Docker will rebuild only the changed layers and restart the container.

3. **Manual Build (Without Compose)**:
   ```bash
   docker build -t leetcode-review .
   docker run -d -p 80:80 -v $(pwd)/data:/app/backend/data --name leetcode-app leetcode-review
   ```
