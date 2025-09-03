# Stage 1: Build the application using a Maven image that includes Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copy the pom.xml and the source code
COPY pom.xml .
COPY src ./src
# Build the project and create the JAR file
RUN mvn clean package -DskipTests

# Stage 2: Create the final, smaller image to run the application
FROM openjdk:17-slim
WORKDIR /app
# Use a wildcard to copy the JAR file, making it more reliable
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
