package exec

import (
	"fmt"
	"net/http"
	"sort"
	"strings"
	"net/url"

	// "time"
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strconv"

	uuid "github.com/satori/go.uuid"
)


type LoginUser struct {
   Nickname string
   Password string
}

func UploadFile(w http.ResponseWriter, r *http.Request) {

	//Path for storing image in server
	path := "./static/"

	mr, err := r.MultipartReader()
	if err != nil {
		fmt.Println("err", err)
		return
	}
	fileName := ""

	for {
		part, err := mr.NextPart()

		//Break, if no more file
		if err == io.EOF {
			break
		}
        	//Get File Name attribute
		fileName = part.FileName()
    absPath, _ := filepath.Abs(path)

	  sessionToken := uuid.NewV4().String()
    c, _ := regexp.Compile(`\.\w*`)
    match := c.FindString(fileName)
    fileName = sessionToken + match
		//Open the file, Create file if it's not existing
		dst, err := os.OpenFile(absPath+"/"+fileName, os.O_WRONLY|os.O_CREATE, 0644)
		if err != nil {
      fmt.Println(dst, err)
			return
		}

		for {
			//Create and read the file into temparory byte array
			buffer := make([]byte, 100000)
			cBytes, err := part.Read(buffer)

			//break when the reading process is finished
			if err == io.EOF {
      fmt.Println(err)
				break
			}

			//Write into the file from byte array
      _, err = dst.Write(buffer[0:cBytes])
      if err != nil {
        fmt.Println(err)
      }
      
		}
		defer dst.Close()
	}

	// w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(fileName)
}

func UserAPI(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		
		var users []UserData
		var err error

		// requestUrl := r.URL.Path
		// m, err := url.ParseQuery(requestUrl)
		// fmt.Println(m, err)
		path := strings.Split(r.URL.Path, "/")
		if len(path) == 7 {
			if path[4] != "nickname" && path[4] != "email" {
				HandleErr(err)

				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			if path[4] == "nickname" {
				users, err = FromUsers("nickname", path[5])
			} else {
				users, err = FromUsers("email", path[5])
			}
		} else if len(path) == 6 {
			users, err = FromUsers("userId", path[4])
		} else {
			users, err = FromUsers("", "")
		}

		if err != nil {
			HandleErr(err)

			// https://golangbyexample.com/500-status-http-response-golang/
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		jsonUsers, err := json.Marshal(users)
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		fmt.Fprintln(w, string(jsonUsers))
	case "POST":
		// https://stackoverflow.com/questions/27595480/does-golang-request-parseform-work-with-application-json-content-type
		var v map[string]interface{}

		err := json.NewDecoder(r.Body).Decode(&v)
		
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		// var postType = v["type"]
		// switch postType {
		// case "register":
		var nickname  = v["Nickname"]
		var password  = v["Password"]
		var email	  = v["Email"]
		var firstName = v["FirstName"]
		var lastName  = v["LastName"]
		var age		  = v["Age"]
		var bio		  = v["Bio"]
    	var avatar 	  = v["Avatar"]

		// toDo: FrontEnd
		// var isPrivate = v["Private"]

		respUser := AuthRegister(nickname, email, password, firstName, lastName, age, bio, avatar)

		// groupMembers, err := FromGroupMembers("UserId", auth.UserId)

		// 		if err != nil {
		// 			HandleErr(err)
		// 			w.WriteHeader(http.StatusInternalServerError)
		// 			return 
		// 		}

		// 		for _, c2 := range groupMembers {
		// 			if c2.CatId == c.CatId {
		// 				returnCategories = append(returnCategories, c)
		// 				break
		// 			} 
		// 		}

		if (respUser != ResponseRegisterUser{}) {
			// fmt.Println(errMsg)
			// pageTemplate.InvalidLogin = reason
			// loginFail = 1
			//errors.New("Nickname already in use")
			
			res, err := json.Marshal(respUser)
			if err != nil {
				fmt.Println("Error in API.go -> UserAPI -> case POST:", err)  
			}
			w.WriteHeader(419)
			w.Write(res)
		} else {
			err = Register(nickname, email, password, firstName, lastName, age,bio, avatar)
			if err != nil {
				fmt.Println("API161+", err)
				w.WriteHeader(http.StatusInternalServerError)
				// w.Write([]byte("ERROR: 500 Internal server error"))

			} else {
				res, err := json.Marshal(respUser)
				if err != nil {
					fmt.Println("API168+", err)
					w.WriteHeader(http.StatusInternalServerError)
					// w.Write([]byte("ERROR: 500 Internal server error"))
				}
				w.WriteHeader(http.StatusCreated)
				w.Write(res)
			}
		}
	}
}

func PostApi(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		type toPosts struct {
			Post	 PostData
			// PostLike []PLikeData

			// Likes	 int
			// Dislikes int

			User     string
			Category PostCategoryData
		}

		path := strings.Split(r.URL.Path, "/")

		var posts []PostData
		var err error


		if len(path) == 7 {
			if path[4] != "category" {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			posts, err = FromPosts("CatId", path[5])
		} else if len(path) == 6 {
			posts, err = FromPosts("PostId", path[4])
		} else {
			posts, err = FromPosts("", "")
		}
		
		if err != nil {
			HandleErr(err)
			// https://golangbyexample.com/500-status-http-response-golang/
			w.WriteHeader(http.StatusInternalServerError)
			return
		}



		var toAPI []toPosts
		for i := len(posts) - 1; i >= 0; i-- {
			c := posts[i]
			user, err := FromUsers("UserId", c.UserId)

			if err != nil {
				HandleErr(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			// postLikes, err := FromPLikes("PostId", c.PostId)

			// if err != nil {
			// 	HandleErr(err)
			// 	w.WriteHeader(http.StatusInternalServerError)
			// 	return
			// }

			category, err := FromPostCategory("postId", c.PostId)

			if err != nil {
				HandleErr(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			var getStruct toPosts

			getStruct.Post = c
			// getStruct.PostLike = postLikes


			// for _, c2 := range postLikes {
			// 	if c2.Value == 1 {
			// 		getStruct.Likes++
			// 	} else if c2.Value == -1 {
			// 		getStruct.Dislikes++
			// 	}
			// }


			getStruct.User = user[0].Nickname
			getStruct.Category = category[0]

			// getStruct.Category = category[0].Title
			
			toAPI = append(toAPI, getStruct)
		}
		jsonPosts, err := json.Marshal(toAPI)
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		fmt.Fprintln(w, string(jsonPosts))
	case "POST":
		var v map[string]interface{}

		err := json.NewDecoder(r.Body).Decode(&v)
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		userToken	:= v["userToken"]
		categoryIds := v["categories"]
		title  		:= v["title"]
		body   		:= v["body"]
		// ToDo:
		// image		:= v["image"]

		user, err := FromSessions("sessionId", userToken)
		
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if len(user) == 0 {
			w.WriteHeader(http.StatusInternalServerError)
			HandleErr(err)
			return
		}

		err = Post(user[0].UserId, categoryIds, title, body)
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

	  posts, err := FromPosts("", "")
	  if err != nil {
	  	HandleErr(err)
	  	w.WriteHeader(http.StatusInternalServerError)
	  	return
	  }
	  postId := strconv.Itoa(len(posts))
	  w.Write([]byte(postId))
		w.WriteHeader(http.StatusCreated)
	}
}

func CommentAPI(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		type toComments struct {
			Comment	 	 CommentData
			// CommentLikes []CLikeData

			// Likes	 int
			// Dislikes int

			User     string
		}

		path := strings.Split(r.URL.Path, "/")

		var comments []CommentData
		var err error

		if len(path) == 7 {
			if path[4] != "post" {
				return
			}
			comments, err = FromComments("PostId", path[5])
		} else if len(path) == 6 {
			comments, err = FromComments("CommentId", path[4])
		} else if len(path) == 5{
			comments, err = FromComments("", "")
		}
		
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		var toAPI []toComments
		for _, c := range comments {
			user, err := FromUsers("UserId", c.UserId)

			if err != nil {
				HandleErr(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			// commentLikes, err := FromCLikes("CommentId", c.CommentId)

			// if err != nil {
			// 	w.WriteHeader(http.StatusInternalServerError)
			// 	return
			// }

			var getStruct toComments

			getStruct.Comment = c
			// getStruct.CommentLikes = commentLikes

			// for _, c2 := range commentLikes {
			// 	if c2.Value == 1 {
			// 		getStruct.Likes++
			// 	} else if c2.Value == -1 {
			// 		getStruct.Dislikes++
			// 	}
			// }

			if len(user) != 0 {
				getStruct.User = user[0].Nickname
				toAPI = append(toAPI, getStruct)				
			}
		}
		jsonPosts, err := json.Marshal(toAPI)
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		fmt.Fprintln(w, string(jsonPosts))
	case "POST":
		var v map[string]interface{}

		err := json.NewDecoder(r.Body).Decode(&v)
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		userToken	:= v["userToken"]
		// commentId	:= v["commentId"]
		postId  	:= v["postId"]
		body   		:= v["body"]
		// ToDo:
		// image		:= v["image"]

		user, err := FromSessions("sessionId", userToken)

		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if len(user) == 0 {
			w.WriteHeader(http.StatusInternalServerError)
			HandleErr(err)
			return
		}

		err = Comment(body, postId, user[0].UserId)
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}
}

func CategoryAPI(w http.ResponseWriter, r *http.Request) {
	if r.Method != "OPTIONS" {
		auth := AuthenticateSession(r.Header["Authentication"])
		if (auth == SessionData{}) {
			fmt.Println("CategoryAPI, Custom Error: auth == sessiondata{}")

			w.WriteHeader(500)
			return
		}
		switch r.Method {
		case "GET":
			
			categories, err := FromCategories("", "")
			if err != nil {
				// https://golangbyexample.com/500-status-http-response-golang/
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			var returnCategories []CategoryData
			for _, c := range categories {
				//if index < 3 {
					returnCategories = append(returnCategories, c)
					// break
				//}
				
				
			}
			jsonCategories, err := json.Marshal(returnCategories)
			if err != nil {
				HandleErr(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			fmt.Fprintln(w, string(jsonCategories))
		case "POST":
			auth := AuthenticateSession(r.Header["Authentication"])
			if (auth == SessionData{}) {
				fmt.Println("CategoryAPI, Custom Error: auth == sessiondata{}")

				w.WriteHeader(500)
				return
			}

			// https://stackoverflow.com/questions/27595480/does-golang-request-parseform-work-with-application-json-content-type
			var v map[string]interface{}
			err := json.NewDecoder(r.Body).Decode(&v)
			if err != nil {
				HandleErr(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			categories, err := FromCategories("", "")
			if err != nil {
				HandleErr(err)
				// https://golangbyexample.com/500-status-http-response-golang/
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			var title = v["title"]
			// var userToken = v["userToken"]



			// var mainCategory = v["main"]

			for _, c := range categories {
				
				if c.Title == title.(string) {
					w.WriteHeader(409)
					return
				}
			}

			fmt.Println(categories)

			// if !success {
			// 	w.WriteHeader(419)
			// 	w.Write([]byte(errMsg))
			// } else {
			InsertCategory(title, auth.UserId, false)
			w.WriteHeader(http.StatusCreated)
			// }
		
		}
	}
}

func PostLikeAPI(w http.ResponseWriter, r *http.Request) {
	
	switch r.Method {
	case "GET":
	case "POST":
		var v map[string]interface{}
		
		err := json.NewDecoder(r.Body).Decode(&v)
		
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		var postId = v["postId"]
		var userToken = v["userToken"]
		var value = v["value"]

		user, err := FromSessions("sessionId", userToken)

		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if len(user) == 0 {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		userId := user[0].UserId

		err = LikePost(userId, postId, value)

		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)

	}
}

func SessionAPI(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		// fmt.Fprintln(w, r.Header["Authentication"])
		auth := AuthenticateSession(r.Header["Authentication"])
		if (auth == SessionData{}) {
			fmt.Println("526, Custom Error: auth == sessiondata{}")

			w.WriteHeader(500)
			return
		}

		w.WriteHeader(200)

		type nicknameStruct struct {
			Nickname string
		}

		var nickname nicknameStruct
		nickname.Nickname = auth.Nickname
		nicknameJson, err := json.Marshal(nickname)

		if err != nil {
			HandleErr(err)
			w.WriteHeader(500)
			return
		}
		w.Write(nicknameJson)

	case "POST":
		var v map[string]interface{}
		err := json.NewDecoder(r.Body).Decode(&v)
		if err != nil {
			HandleErr(err)
			fmt.Println("found error in here")
			w.WriteHeader(500)
		}
		// https://stackoverflow.com/questions/27595480/does-golang-request-parseform-work-with-application-json-content-type
		// var postType = v["postType"]
		var nickname = v["Nickname"]
		var password = v["Password"]

		authLogin, errMsg := AuthLogin(nickname, password)
		if !authLogin {
			fmt.Println(errMsg)

			userRes := LoginUser{
				Nickname: errMsg,
				Password: errMsg,
			}

			response, err := json.Marshal(userRes)
			if err != nil { 
				fmt.Println(err)
			}
			
			w.WriteHeader(419)
			w.Write(response)
		} else {
			err := Login(nickname)
			
			if err != nil {
				HandleErr(err)
				w.WriteHeader(419)
				return
			}

			user, err := FromSessions("nickname", nickname)

			if err != nil {
				HandleErr(err)
				w.WriteHeader(419)
				return
			}

			if len(user) == 0 {
				users, err := FromUsers("email", nickname)

				if err != nil {
					w.WriteHeader(500)
					return				
				}

				if len(users) == 0 {
					w.WriteHeader(500)
					return				
				}
				user, err = FromSessions("userId", users[0].UserId)
				if len(user) == 0 {
					w.WriteHeader(500)
					return				
				}
				if err != nil {
					w.WriteHeader(500)
					return				
				}
				// ToDo: allow for email login
			}


			cookie := &http.Cookie {
				Name: "session",
				Value: user[0].SessionId,
				MaxAge: 900,					
			}

			cookieJSON, err := json.Marshal(cookie);
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			w.Write(cookieJSON)
		}
	case "DELETE":
		var v map[string]interface{}
		err := json.NewDecoder(r.Body).Decode(&v)
		if err != nil {
			HandleErr(err)
		}
		var token = v["token"]
		session, _ := FromSessions("sessionId", token)

		if len(session) == 0 {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		err = DeleteSession(session[0].Nickname)
		if err != nil {
			w.WriteHeader(419)
			w.Write([]byte("Uh oh! something went wrong"))
		} else {
			w.WriteHeader(200)
		}

	}
}


func OnlineUsersAPI(w http.ResponseWriter, r *http.Request) {
	if r.Method != "OPTIONS" {
		
		auth := AuthenticateSession(r.Header["Authentication"])

		if (auth == SessionData{}) {
			fmt.Println("642, Custom Error: auth == sessiondata{}")
			w.WriteHeader(419)
			return
		}

		switch r.Method {
		case "GET":
			sessions, err := FromSessions("", "")
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
	
			users, err := FromUsers("", "")
	
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
	
			messages, err := FromMessages(auth.UserId, "")

			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			
			type OnOffUsersStruct struct {
				Online []OnlineUserData
				Offline []OnlineUserData
			}
	
			// var returnUsers []OnlineUserData
			var onOffUsers OnOffUsersStruct
	
			// var onOffUsers.Online []OnlineUserData
			// var onOffUsers.Offline []OnlineUserData
	
	
			for _, session := range sessions {
				var onlineUsers OnlineUserData
				onlineUsers.UserId = session.UserId
				onlineUsers.Online = true
				onlineUsers.Nickname = session.Nickname
				onlineUsers.Avatar = session.Avatar
				
				onOffUsers.Online = append(onOffUsers.Online, onlineUsers)
			}
	
			for _, user := range users {
	
				var found bool
	
        for _, session := range onOffUsers.Online {
          if session.UserId == user.UserId {
            found = true
            break
          }
        }
        if !found {
          var offlineUser OnlineUserData
          offlineUser.UserId = user.UserId
          offlineUser.Online = false
          offlineUser.Nickname = user.Nickname
          offlineUser.Avatar = user.Avatar

					onOffUsers.Offline = append(onOffUsers.Offline, offlineUser)
				}
			}

			for _, user := range onOffUsers.Offline {
				onOffUsers.Online = append(onOffUsers.Online, user)
			}
			var allUsers []OnlineUserData
			allUsers = onOffUsers.Online
			var forSorting []string

			for _, user := range allUsers {
				forSorting = append(forSorting, user.Nickname)
			}

			allUsers = SortAlpha(forSorting, allUsers)

			var orderArray []int

			for i := len(messages)-1; i >= 0; i-- {
				message := messages[i]
				var found bool
				for _, c := range orderArray {
					switch auth.UserId {
					case message.SenderId:
						if c == message.TargetId {
							found = true
							break
						}
					case message.TargetId:
						if c == message.SenderId {
							found = true
							break
						}
					}
				}
				if (!found) {
					switch auth.UserId {
					case message.SenderId:
						orderArray = append(orderArray, message.TargetId)
					case message.TargetId:
						orderArray = append(orderArray, message.SenderId)
					}
				}
			}

			var removeIndexes []int
			var returnUsers []OnlineUserData
				for _, c := range orderArray {
					for index2, c2 := range allUsers {
						switch c {
						case c2.UserId:
							returnUsers = append(returnUsers, c2)
							removeIndexes = append(removeIndexes, index2)
						}
					}
				}
			sort.Ints(removeIndexes)
			
			// var tempAllUsers []OnlineUserData
			for index, c := range removeIndexes {
				allUsers = RemoveElements(allUsers, c-index)
			}

			for _, c := range allUsers {
				returnUsers = append(returnUsers, c)
			}

			var tempUsers []OnlineUserData
			
			for _, user := range returnUsers {
				if user.UserId != auth.UserId {
					tempUsers = append(tempUsers, user)
				}
			}
			returnUsers = tempUsers
			jsonUsers, err := json.Marshal(returnUsers)
			if err != nil {
				HandleErr(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			
			fmt.Fprintf(w, string(jsonUsers))
		}
	}
}


func NotificationsApi(w http.ResponseWriter, r *http.Request) {
	
	if r.Method != "OPTIONS" {

		auth := AuthenticateSession(r.Header["Authentication"])

		if (auth == SessionData{}) {
			fmt.Println("803, Custom Error: auth == sessiondata{}")
			w.WriteHeader(419)
			return
		}
		sessionId, err := FromSessions("sessionId", r.Header["Authentication"][0])
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if len(sessionId) == 0 {
			fmt.Println("sessionid == 0")
			w.WriteHeader(419)
			return
		}
		var userId = (sessionId[0].UserId)
		switch r.Method {
		case "GET":
			notification, err := FromNotifications("UserId", userId)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			notificationJson, err := json.Marshal(notification)
			w.Write(notificationJson)
		case "POST":
			var v map[string]interface{}
			err := json.NewDecoder(r.Body).Decode(&v)
			if err != nil {
				HandleErr(err)
			}
			// https://stackoverflow.com/questions/27595480/does-golang-request-parseform-work-with-application-json-content-type
			// var postType = v["postType"]
			var fromUserId = v["FromUserId"]

			err = Notify(userId, fromUserId)
			if err != nil {
				HandleErr(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			w.WriteHeader(200)
		case "DELETE":
			var v map[string]interface{}
			err := json.NewDecoder(r.Body).Decode(&v)
			if err != nil {
				HandleErr(err)
			}

			var fromUserId = v["FromUserId"]

			err = DeleteNotification(userId, fromUserId)
			if err != nil {
				HandleErr(err)
				w.WriteHeader(419)
				w.Write([]byte("Uh oh! something went wrong"))
			} else {
				w.WriteHeader(200)
			}
		}
	}
}



func MessagesAPI(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":

		auth := AuthenticateSession(r.Header["Authentication"])

		if (auth == SessionData{}) {
			fmt.Println("875, Custom Error: auth == sessiondata{}")

			w.WriteHeader(419)
			return
		}


		messages, err := FromMessages(auth.UserId, "")
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		jsonMessages, err := json.Marshal(messages)
		if err != nil {
			HandleErr(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		
		fmt.Fprintf(w, string(jsonMessages))
	}
}

func ProfileAPI(w http.ResponseWriter, r *http.Request) {

}

func FollowerAPI(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":

		requestUrl := r.URL.Path
		m, err := url.ParseQuery(requestUrl)
		if err != nil {
			w.WriteHeader(419)
			return
		}
		fmt.Println(m)
		userId := m["userId"]
		followers, err := FromFollowers("userId", userId)
		jsonFollowers, err := json.Marshal(followers)
		if err != nil {
			w.WriteHeader(419)
			return
		}
		fmt.Fprintf(w, string(jsonFollowers))
	case
	}
}
// func PostLikeAPI(w http.ResponseWriter, r *http.Request) {
// 	switch r.Method {
// 	case "GET":
// 		type toPostLikes struct {
// 			PostLikes []PLikeData
// 			CommentLikes []CLikeData

// 			User     string
// 		}

// 		path := strings.Split(r.URL.Path, "/")

// 		var comments []CommentData
// 		var err error

// 		if len(path) == 7 {
// 			if path[4] != "post" {
// 				return
// 			}
// 			comments, err = FromComments("PostId", path[5])
// 		} else if len(path) == 6 {
// 			comments, err = FromComments("CommentId", path[4])
// 		} else if len(path) == 5{
// 			comments, err = FromComments("", "")
// 		}
		
// 		if err != nil {
// 			w.WriteHeader(http.StatusInternalServerError)
// 			return
// 		}

// 		var toAPI []toComments
// 		for _, c := range comments {
// 			user, err := FromUsers("UserId", c.UserId)

// 			if err != nil {
// 				w.WriteHeader(http.StatusInternalServerError)
// 				return
// 			}

// 			commentLikes, err := FromCLikes("CommentId", c.CommentId)

// 			if err != nil {
// 				w.WriteHeader(http.StatusInternalServerError)
// 				return
// 			}

// 			var getStruct toComments

// 			getStruct.Comment = c
// 			getStruct.CommentLikes = commentLikes
// 			if len(user) != 0 {
// 				getStruct.User = user[0].Nickname
// 				toAPI = append(toAPI, getStruct)				
// 			}
// 		}
// 		jsonPosts, err := json.Marshal(toAPI)
// 		if err != nil {
// 			w.WriteHeader(http.StatusInternalServerError)
// 			return
// 		}
// 		fmt.Fprintln(w, string(jsonPosts))
// 	case "POST":
// 		var v map[string]interface{}

// 		err := json.NewDecoder(r.Body).Decode(&v)
// 		if err != nil {
// 			HandleErr(err)
// 		}

// 		userToken	:= v["userToken"]
// 		// commentId	:= v["commentId"]
// 		postId  	:= v["postId"]
// 		body   		:= v["body"]

// 		user, err := FromSessions("sessionId", userToken)

// 		if err != nil {
// 			w.WriteHeader(http.StatusInternalServerError)
// 			HandleErr(err)
// 			return
// 		}

// 		if len(user) == 0 {
// 			w.WriteHeader(http.StatusInternalServerError)
// 			HandleErr(err)
// 			return
// 		}

// 		err = Comment(body, postId, user[0].UserId)
// 		if err != nil {
// 			w.WriteHeader(http.StatusInternalServerError)
// 			HandleErr(err)
// 			return
// 		}
// 		w.WriteHeader(http.StatusCreated)
// 	}
// }
