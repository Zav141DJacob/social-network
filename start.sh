# Docker image Build and Run

# V-----FRONTEND-----V
# Move to the frontend/ directory
cd frontend/
# Build the Docker image for the current folder 
# and tag it with `dockerized-react`
sudo docker build . -t dockerized-react

# Run the image in detached mode 
# and map port 3000 inside the container with 3000 on current host
sudo docker run -p 3000:3000 -d dockerized-react

# V------BACKEND-----V
# Move into the backend directory
cd ../backend/

sudo docker build --tag godocker .

# # Updates backend dependencies
# go mod tidy

# # Build backend Docker image
# sudo docker build --rm -t golang-docker-backend .

# # Run backend Docker image
# sudo docker run -p 8000:8000 golang-docker-backend

echo V--Below should be two images: *dockerized-react* and *golang-docker-backend*--V
# Check if the images were created
sudo docker images | grep dockerized-react
sudo docker images | grep godocker

# Opens the page for you! <3
xdg-open http://localhost:3000/