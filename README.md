Heyo!

This project is done by:

Jacob (Jaagup Tomingas)
roosarula (Alex Viik)
Kaarel Kõrv
Oto Tuul

This web application allows for real time messaging privately with other users while also allowing you to create posts and comment into the main forum.

To install the required modules to start the application you need to:

1) `cd frontend/`
2) `npm install`

    wait a minute or two
    if npm install fails then try
    `yarn install`

3) `npm start`

    open a new terminal 
    and move into 
    the real-time-forum
    directory

4) `go run .`

And thats about it!

For the Docker:
just run the `start.sh` script and it should work automatically

To stop docker run the `stop.sh` script
*Note here that `stop.sh` might not remove a container that's holding up the frontend port so you might need to remove it manually

The backend is hosted on 

http://localhost:8000 

and the frontend is hosted on

http://localhost:3000               <---- the main forum application