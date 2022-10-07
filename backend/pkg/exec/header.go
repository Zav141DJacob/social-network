package exec

//Optional ToDo:
//	use JOIN and only use the ID values of tables

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
	Avatar	  string
	RoleId	  int
	Date	  string
	IsPrivate bool
}

type PostData struct {
	PostId int
	UserId int
	Title  string
	Body   string
	Image string
	CatId  int
	Date   string
	Privacy string
	AccessList string
}

type PostCategoryData struct {
	Id			  int
	PostId		  int
	CatId		  int
	CategoryTitle string
}

type CommentData struct {
	CommentId int
	Body	  string
	PostId	  int
	UserId	  int
	Date	  string
	Image     string
}

type CategoryData struct {
	CatId		int
	Title 		string
	Description string
	UserId		int
	IsPublic	bool
  Members []GroupMembersData
  Nonmembers []UserData
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

	// ToDo: implement First name
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
	MessageId	int
	SenderId	int
	SenderName	string
	Message		string
	TargetId	int
	Date		string
}

type GroupMessageData struct {
	MessageId	int
	SenderId	int
	SenderName	string
	Message		string
	TargetId	int
	Date		string
}

type ResponseRegisterUser struct {
	Email           string

	// ToDo: make Nickname optional; Talk with Alex
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

	// ToDo: implement First name
	Nickname string
	Avatar	 string
}

type GroupMembersData struct {
	Id		int
	UserId	int
	CatId	int
}

type FollowerData struct {
	Id				 int
	Nickname		 string
	UserId			 int
  Avatar  string

	FollowerNickname string
	FollowerUserId	 int
	FollowerAvatar	 string
}

type NotificationsListData struct {
	Id				int
	UserId			int
	Nickname		string
	UserAvatar		string
	TargetId		int
	TargetName		string
	CatId			int
	CategoryTitle	string
	Type			string
}

type EventsData struct {
	Id			int
	Title		string
	Description	string
	Date		string
}
// type ErrorString struct {
// 	s string
// }
