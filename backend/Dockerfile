FROM golang:1.17-alpine
WORKDIR /
COPY . ./
RUN go mod download
RUN apk add --update gcc musl-dev
RUN go build -o /forum
CMD ["/forum"]