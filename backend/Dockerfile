# syntax=docker/dockerfile:1

# specify the base image to  be used for the application, alpine or ubuntu
FROM golang:1.17-alpine

# create a working directory inside the image
WORKDIR /forum

COPY . .

RUN apk update

# RUN apk add github.com/mattn/go-sqlite3

# download Go modules and dependencies
RUN go mod download

# # compile application
RUN go build -o forum .
 
# tells Docker that the container listens on specified network ports at runtime
EXPOSE 8000

# command to be used to execute when the image is used to start a container
CMD [ "forum" ]