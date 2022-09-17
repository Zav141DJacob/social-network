package exec

import ()


type PageTemplate struct {
	Nickname   		string
	RoleID     		int
	Categories 		[]CategoryData
	Posts      		[]PostData
	PostLikes  		[]PLikeData
	Comments   		[]CommentData
	Post       		PostData
	InvalidLogin	string
	Page	   		string
}

// The date in the structs is the time when the table element was created

type UserData struct {
	UserId    int
	Nickname  string
	Email	  string
	Password  string
	FirstName string
	LastName  string
	Age		  string
	Bio		  string
	Avatar		  string
	RoleId	  int
	Date	  string
	IsPrivate bool
}

type PostData struct {
	PostId int
	UserId int
	Title  string
	Body   string
	Date   string
}


//ToDo
// make this dynamic somehow (with maps maybe?)
// I'm a bit too lazy at the moment to do that -Jacob
// map[string]bool
type PostCategoryData struct {
	PostId		  int

	Categories	map[string]bool
	HasGolang 	  bool
	HasJavascript bool
	HasRust		  bool
}
type CommentData struct {
	CommentId int
	Body	  string
	PostId	  int
	UserId	  int
	Date	  string
}

type CategoryData struct {
	CatId	int
	Title 	string
	UserId	int
	IsMain	bool
}

// Post like struct
type PLikeData struct {
	UserId int
	PostId int
	Value  int
}

// Comment like struct
type CLikeData struct {
	UserId	  int
	CommentId int
	Value	  int
}

// Session struct
type SessionData struct {
	SessionId string
	Nickname  string
	Avatar	  string
	UserId	  int
	RoleId	  int
	Date	  string
}

type NotificationData struct {
	NotificationId int
	UserId		   int
	FromUserId	   int
}

// Message struct
type MessageData struct {
	MessageId int
	SenderId  int
	Message   string
	TargetId  int
	Date	  string
}

type ResponseRegisterUser struct {
	Email           string
	Nickname        string
	Password        string
	ConfirmPassword string
	FirstName       string
	LastName        string
	Age             string
}

type OnlineUserData struct {
	UserId	 int
	Online	 bool
	Nickname string
	Avatar  string
}

type GroupMembersData struct {
	Id	int
	UserId	int
	CatId	int
}
// type ErrorString struct {
// 	s string
// }
