package exec

import (
	// "fmt"
	"fmt"
	// "strconv"
	"database/sql"
	"time"

	// "net/http"
	
	"golang.org/x/crypto/bcrypt"
	"github.com/gorilla/websocket"

)

// http.HandleFunc("/api/v1/posts/category/" + strId + "/", main.Middleware(exec.PostCatAPI))

// http.HandleFunc("/api/v1/posts/" + strId + "/", main.Middleware(exec.SinglePostAPI))

// Inserts a post into the database
// Requires:
//	user Id
//	title
//	post body
func Post(userId, catId, title, body interface{}) error {
	
	stmt, err := Db.Prepare("INSERT INTO posts (userId, title, body, catId, date) VALUES (?, ?, ?, ?, ?);")

	if err != nil {
		return err
	}	

	defer stmt.Close()

	_, err = stmt.Exec(userId, title, body, catId, time.Now())

	if err != nil {
		return err
	}

	return nil
}

// Inserts a user into the database
// Requires:
// 	nickname
// 	email
//	password
//	first name
//	last name
//	age
func Register(nickname, email, password, firstName, lastName, age, bio, avatar interface{}) error {
	stmt, err := Db.Prepare(
		`INSERT INTO users 
		(nickname, eMail, password, firstName, lastName, age, bio, avatar, roleId, date, isPrivate) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		RETURNING userId;`)

	if err != nil {
		HandleErr(err)
		return err
	}

	//hashes the password
	pass := password.(string)
	hash, err := bcrypt.GenerateFromPassword([]byte(pass), 8)
	
	if err != nil {
		return err
	}

	var id int
	fmt.Println(id)

	defer stmt.Close()
  	err = stmt.QueryRow(nickname, email, hash, firstName, lastName, age.(string), bio, avatar, 1, time.Now(), true).Scan(&id)
	// fmt.Println(res)

	if err != nil {
		return err
	}
	fmt.Println(id)

	stmt, err = Db.Prepare(
		`INSERT INTO groupMembers 
		(userId, catId) 
		VALUES (?, ?);`)
	
	
	_, err = stmt.Exec(id, 1)
	_, err = stmt.Exec(id, 2)
	_, err = stmt.Exec(id, 3)
	if err != nil {
		return err
	}


	return nil
}

// Inserts a comment into the comments table
// Requires:
//	comment body
//	post id
//	user id
func Comment(body, postId, userId interface{}) error{
	stmt, err := Db.Prepare("INSERT INTO comments (body, postId, userId, date) VALUES (?, ?, ?, ?);")

	if err != nil {
		return err
	}
	
	defer stmt.Close()
	stmt.Exec(body, postId, userId, time.Now())
	return nil
}


// Inserts a category into the database
func InsertCategory(title, description , userId, isPublic interface{}) error {
	var catId int
	stmt, err := Db.Prepare(`INSERT INTO categories (title, description, userId, isPublic) 
	VALUES (?, ?, ?, ?)
	RETURNING catId`)
	
	if err != nil {
		return err
	}
	
	err = stmt.QueryRow(title, description, userId, isPublic).Scan(&catId)

	if err != nil {
		return err
	}

	stmt, err = Db.Prepare("INSERT INTO groupMembers (userId, catId) VALUES (?, ?)")
	
	if err != nil {
		return err
	}
	
	stmt.Exec(userId, catId)
	Manager.groupChats[IdType(catId)] = make(map[IdType]*websocket.Conn)

	// _, err = Db.Exec(`ALTER TABLE postCategory ADD COLUMN "has` + title.(string) + `" BOOLEAN NOT NULL`)

	// if err != nil {
	// 	return err
	// }
	
	// stmt.Exec("has" + title.(string))

	defer stmt.Close()
	return nil
}

func InsertSession(session, nickname, avatar string, userId, roleId int) error {
	stmt, err := Db.Prepare("INSERT INTO sessions (sessionId, nickname, avatar, userId, roleId, date) VALUES (?, ?, ?, ?, ?, ?)")
	
	if err != nil {
		return err
	}

	defer stmt.Close()
	stmt.Exec(session, nickname, avatar, userId, roleId, time.Now())
	return nil
}

func PingUser(userId, fromUserId interface{}) error {
	stmt, err := Db.Prepare("INSERT INTO notifications (userId, fromUserId) VALUES (?, ?)")
	
	if err != nil {
		return err
	}

	defer stmt.Close()
	stmt.Exec(userId, fromUserId)
	return nil
}

func Notify(user, target []UserData, catId, mode interface{}) error {

	var stmt *sql.Stmt
	var err error

	list, err := FromNotificationsList("userId", user[0].UserId)
	if err != nil {
		return err
	}

	for _, l := range list {
		if l.TargetId == target[0].UserId && l.Type == mode && l.CatId == catId {
			return CreateErr("409")
		} 
	}
	
	stmt, err = Db.Prepare(`INSERT INTO notificationsList 
	(userId, nickname, userAvatar, targetId, targetName, catId, categoryTitle, type) 
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
	
	if err != nil {
		return err
	}

	// user, err := FromUsers("userId", userId)
	// if err != nil {
	// 	return err
	// }
	category, err := FromCategories("catId", catId)
	if err != nil {
		return err
	}


	defer stmt.Close()
	if len(category) == 0 {
		stmt.Exec(user[0].UserId, user[0].Nickname, user[0].Avatar, target[0].UserId, target[0].Nickname, catId, "", mode)
	} else {
		stmt.Exec(user[0].UserId, user[0].Nickname, user[0].Avatar, target[0].UserId, target[0].Nickname, catId, category[0].Title, mode)

	}
	return nil
}

func Message(senderId, targetId, message interface{}) error {
	stmt, err := Db.Prepare("INSERT INTO messages (senderId, senderName, message, targetId, date) VALUES (?, ?, ?, ?, ?)")
	
	if err != nil {
		return err
	}

	user, err := FromUsers("userId", senderId)
	if err != nil {
		return err
	}

	defer stmt.Close()
	stmt.Exec(senderId, user[0].Nickname, message, targetId, time.Now())
	return nil
}


// ToDo:
//	rename followerUserId and userId because they are the opposite currently 
//	(or idk its very confusing for me) -Jacob
func Follow(followerUserId, userId interface{}) error{
	stmt, err := Db.Prepare(`INSERT INTO followers 
	(nickname, userId, avatar, followerNickname, followerUserId, followerAvatar) 
	VALUES (?, ?, ?, ?, ?, ?);`)

	if err != nil {
		return err
	}
	
	user, err := FromUsers("userId", userId)
	if err != nil {
		return err
	}

	follower, err := FromUsers("userId", followerUserId)
	if err != nil {
		return err
	}

	defer stmt.Close()
	_, err = stmt.Exec(user[0].Nickname, userId, user[0].Avatar, follower[0].Nickname, followerUserId, follower[0].Avatar)
	if err != nil {
		return err
	}
	return nil
}


// 		"messageId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
// 		"senderId" INTEGER NOT NULL,
// 		"message" TEXT NOT NULL, 
// 		"targetId" INTEGER NOT NULL,
// 		"date" DATETIME NOT NULL,
func GroupMessage(senderId, senderName, message, targetId interface{}) error {
	stmt, err := Db.Prepare("INSERT INTO groupMessages (senderId, senderName, message, targetId, date) VALUES (?, ?, ?, ?);")

	if err != nil {
		return err
	}	

	defer stmt.Close()

	stmt.Exec(senderId, senderName, message, targetId, time.Now())

	return nil
}
