# Multi-stage build for React + Spring Boot application

# Frontend build stage
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ .
RUN npm run build

# Backend build stage
FROM maven:3.9.4-openjdk-21-slim as backend-builder
WORKDIR /app/backend
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Production stage
FROM openjdk:21-jdk-slim
WORKDIR /app

# Copy backend jar
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Copy frontend build files
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port (adjust if needed)
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]