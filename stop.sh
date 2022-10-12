#!/bin/bash
echo "Removing container"
sudo docker rm -f forum
echo ""
echo "Removing image"
sudo docker rmi -f goforum
echo "Removing container"
sudo docker rm -f dockerized-react
echo ""
echo "Removing image"
sudo docker rmi -f dockerized-react
echo ""
echo "Pruning"
sudo docker system prune