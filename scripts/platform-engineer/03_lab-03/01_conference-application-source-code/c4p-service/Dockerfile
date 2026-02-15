FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o c4p-service c4p-service.go

FROM alpine:3.18
RUN apk --no-cache add ca-certificates
WORKDIR /app/
COPY --from=builder /app/c4p-service .
COPY --from=builder /app/kodata ./kodata
ENV KO_DATA_PATH=/app/kodata
EXPOSE 8080
CMD ["./c4p-service"]
