FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o notifications-service notifications-service.go

FROM alpine:3.18
RUN apk --no-cache add ca-certificates
WORKDIR /app/
COPY --from=builder /app/notifications-service .
COPY --from=builder /app/kodata ./kodata
ENV KO_DATA_PATH=/app/kodata
EXPOSE 8080
CMD ["./notifications-service"]
