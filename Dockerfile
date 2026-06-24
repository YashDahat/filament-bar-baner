FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY backend/ .
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
RUN mvn package -q -DskipTests

FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
