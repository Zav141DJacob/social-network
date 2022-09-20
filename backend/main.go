package main

import(
	"fmt"
	"net/http"
	"forum/pkg/exec"
)

func main(){
  port := ":8000"

  err := exec.Initialize()
  if err != nil {
    exec.HandleErr(err)
    return
  }

  fs := http.FileServer(http.Dir("./static"))
  http.Handle("/static/", http.StripPrefix("/static/", fs))

  http.HandleFunc("/static", func(w http.ResponseWriter, r *http.Request) {
    fmt.Println("HOI")
    http.ServeFile(w, r, "image.html")
  })

  fileServer := http.StripPrefix("/", http.FileServer( http.Dir("./")))
  http.Handle("/", fileServer)

  // ToDo: change Middleware function name
  http.HandleFunc("/api/v1/users/", Middleware(exec.UserAPI))
  http.HandleFunc("/api/v1/posts/", Middleware(exec.PostAPI))
  http.HandleFunc("/api/v1/categories/", Middleware(exec.CategoryAPI))
  http.HandleFunc("/api/v1/sessions/", Middleware(exec.SessionAPI))
  http.HandleFunc("/api/v1/comments/", Middleware(exec.CommentAPI))

  http.HandleFunc("/api/v1/online-users/", Middleware(exec.OnlineUsersAPI))
  http.HandleFunc("/api/v1/messages/", Middleware(exec.MessagesAPI))
  http.HandleFunc("/api/v1/notifications/", Middleware(exec.NotificationsApi))

  http.HandleFunc("/api/v1/followers/", Middleware(exec.FollowerAPI))
  http.HandleFunc("/api/v1/profile/", Middleware(exec.ProfileAPI))

  http.HandleFunc("/api/v1/upload/", Middleware(exec.UploadFile))

	// websocket stuff
	http.HandleFunc("/ws/", Middleware(exec.WsEndpoint))

  err = exec.WsSetup()

  if err != nil {
    exec.HandleErr(err)
    return
  }

	fmt.Println("listening on" + port)
	fmt.Println("http://localhost" + port)
	http.ListenAndServe(port, nil)
}


// Allows foreign sites to access Data
func Middleware(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Middleware method: " + r.Method)

	  	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authentication")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		fn.ServeHTTP(w, r)
	}
}

