# Multi-stage build for React + Spring Boot application

# Frontend build stage
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY frontend/ .
RUN npm run build

# Backend build stage
FROM openjdk:21-jdk-slim as backend-builder

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend

# Copy Maven files first for better caching
COPY backend/pom.xml .
COPY backend/mvnw .
COPY backend/.mvn .mvn

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source and build
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Production stage
FROM openjdk:21-jdk-slim
WORKDIR /app

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy backend jar
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Copy frontend build files
COPY --from=frontend-builder /app/frontend/dist ./static

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM optimization for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Run the application
CMD java $JAVA_OPTS -jar app.jar
