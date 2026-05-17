# Build stage
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to cache them
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Create default directory for uploads
RUN mkdir -p uploads
# Port on which the Spring Boot app runs (Render overrides this with dynamic PORT)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
