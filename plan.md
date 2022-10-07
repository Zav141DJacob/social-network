TODO:
DM
create 10+ message scenario and load only 10 latest
scroll to last message problem

LOGOUT
send DELETE method

LEFT SIDEBAR
if category is chosen add remove filter button

FEED

POST
comment submit button
comment should not be empty
post title should not be empty (check for spaces only)

DEVELOPMENT BRIEF:

FEED
Näidata postitusi ja kommentaare

CHAT
Näidata kõiki kasutajaid - sorteerida viimaste sõnumite põhjal / või tähestiku järjekorras
DM funktsionaalsus kasutajate vahel
Klikkides kasutajale avaneb chat aken viimase 10 sõnumiga. Scrollides üles laeb eelnevad 10.
Sõnumitel peab olema aeg ja kasutajanimi
Sõnumiga tuleb notification

POSTS
Postituse loomine
Kommentaaride lisamine

PLAN:
Homepage - facebook clone, keskel on postitused ja paremal ääres on DM kasutajad

NEWS
catergories - JSON (catId, title, userId, isPublic) - all the info about category

GET post - send session token to 'api/v1/posts/x' 

GET all posts from category - api/v1/posts/?categoryId=categoryId

GET profile info - api/v1/profile/nickname
frontend - localhost:3000/users/Jacob
JSON {
    user Userdata,
    followers []FollowerData (see below the structure)
    NonFollowers []UserData <--- user data array of non followers
  }

FollowerData {
    nickname    <
    id         <---- these are the current profile data
    userid      <

    FollowerNickname <--- these are the follower data
    FollowerUserId    <
    FollowerAvatar //TODO

  }

get all followers - api/v1/followers/?userId={userId}
start following (POST) - api/v1/followers/?userId={userId}
body {
    userId: {userId}
  }

stop following (DELETE) - api/v1/followers/?userId={userId}
body {
    userId: {userId}
  }


// ERROR codes:
//    201: "Created"
//    204: "No Content"

//    401: "Unauthorized"
//    409: "Conflict"
//    419: i forgot xd; Probably a general error 

//    500: "Internal Server Error"

TODO: if on a group page the post will be in that group only

KAAREL 
Registration
  If nickname is not provided
    Generate nickname (and check if it is available)
  If avatar is not provided
    BUG: default avatar is not working (front end problem?)

OTO & ALEX
Events
  Create event form
  Event page
    Invite users
    Attending users
    Event name, desc, date
  Send notification (BUG: user created group event doesn't send)

Groups
  Invite button CSS
    Send notification to target
  Show events

Comments
  Image CSS
  Add image button CSS
  Hear me! button CSS


