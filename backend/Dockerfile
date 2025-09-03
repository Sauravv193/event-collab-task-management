# Stage 1: Build the application using Maven
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
# Copy the pom.xml and the source code
COPY pom.xml .
COPY src ./src
# Build the project and create the JAR file
RUN mvn clean package -DskipTests

# Stage 2: Create the final, smaller image to run the application
FROM openjdk:17-slim
WORKDIR /app
# Copy the JAR file from the 'build' stage
COPY --from=build /app/target/event_based_task-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
