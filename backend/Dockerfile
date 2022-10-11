# syntax=docker/dockerfile:1

# specify the base image to  be used for the application, alpine or ubuntu
FROM golang:1.17-alpine

# create a working directory inside the image
WORKDIR /app
RUN apk --update-cache add sqlite

RUN export CC=gcc; go get -v -x github.com/mattn/go-sqlite3
# copy Go modules and dependencies to image
COPY go.mod ./

# download Go modules and dependencies
RUN go mod download

COPY pkg ./forum/

# copy directory files i.e all files ending with .go
COPY *.go ./
# COPY static ./

# # compile application
RUN go build -o /godocker
 
# tells Docker that the container listens on specified network ports at runtime
EXPOSE 8000

# command to be used to execute when the image is used to start a container
CMD [ "/godocker" ]