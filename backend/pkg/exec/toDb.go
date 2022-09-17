package exec

import (
	// "fmt"
	"fmt"
	"strconv"
	"time"

	// "net/http"
	"golang.org/x/crypto/bcrypt"
)

// http.HandleFunc("/api/v1/posts/category/" + strId + "/", main.Middleware(exec.PostCatAPI))

// http.HandleFunc("/api/v1/posts/" + strId + "/", main.Middleware(exec.SinglePostAPI))

// Inserts a post into the database
// Requires:
//	user Id
//	title
//	post body
func Post(userId, catId, title, body interface{}) error {
	
	stmt, err := Db.Prepare("INSERT INTO posts (userId, title, body, date) VALUES (?, ?, ?, ?);")

	if err != nil {
		return err
	}	

	defer stmt.Close()
	stmt.Exec(userId, title, body, time.Now())
	

	categoryList, err := FromCategories("", "")

	if err != nil {
		return err
	}

	posts, err := FromPosts("", "")

	if err != nil {
		return err
	}

	

	postId := len(posts)
	var categoryListString string
	var boolValues []bool

	var count = 0

	var values string
	

	for _, category := range categoryList {
		values += "?, "
		categoryListString += "has" + category.Title  + ", "
		if len(catId.([]interface{})) <= count {
			boolValues = append(boolValues, false)
			continue
		}
		if category.CatId == int(catId.([]interface{})[count].(float64)) {
			boolValues = append(boolValues, true)
			count++
		} else {
			boolValues = append(boolValues, false)
		}

	}
	stmt, err = Db.Prepare("INSERT INTO postCategory (postId, " + categoryListString[:len(categoryListString) - 2] + ") VALUES (?, " + values[:len(values)-2] + ");")

	if err != nil {
		return err
	}

	//ToDo
	// make this dynamic (allow for non-hardcoded solution)
	stmt.Exec(postId, boolValues[0], boolValues[1], boolValues[2])

	// for _, c := range catId.([]interface{}) {
	// 	stmt.Exec(userId, c, title, body, time.Now())
	// }
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
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)

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

	defer stmt.Close()
  	_, err = stmt.Exec(nickname, email, hash, firstName, lastName, age.(string), bio, avatar, 1, time.Now(), true)
	if err != nil {
    	fmt.Println("toDb113", err)
		HandleErr(err)
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

// Inserts a like into the postLikes table
// Requires:
//	user id
//	post id
//	value
func LikePost(userId, postId, value interface{}) error{
	var found bool
	// Finds all records in the postLikes table where the userId matches
	liked, err := FromPLikes("userId", userId)

	if err != nil {
		return err
	}
	// Loops through the records to find one where the postId matches
	for _, c := range liked {
		if strconv.Itoa(c.PostId) == postId.(string) {
			found = true

			// If the user has already liked the post 
			// then it will remove the like
			if strconv.Itoa(c.Value) == value.(string) {
				_, err := Db.Exec(`
				DELETE FROM postLikes 
					WHERE userId = ? 
					AND postId = ?`, 
					userId, postId)
				if err != nil {
					return err
				}

			// If the user had already liked the post it will
			// dislike it and also the other way around
			} else {
				_, err := Db.Exec(`
				UPDATE postLikes 
					SET value = ? 
					WHERE userId = ? 
					AND postId = ?`, 
					value, userId, postId)
				if err != nil {
					return err
				}
			}
			break
		} 
	}

	// If there was no record of the user liking the post 
	// then it will insert one into the database
	if !found {
		stmt, err := Db.Prepare("INSERT INTO postLikes (userId, postId, value) VALUES (?, ?, ?);")

		if err != nil {
			return err
		}
		
		defer stmt.Close()
		stmt.Exec(userId, postId, value)
	}
	return nil
}

// Inserts a like into the commentLikes table
// Requires:
//	user id
//	comment id
//	value
func LikeComment(userId, commentId, value interface{}) error{
	var found bool

	// Finds all records in the postLikes table where the userId matches
	liked, err := FromCLikes("userId", userId)

	if err != nil {
		return err
	}

	// Loops through the records to find one where the commentId matches
	for _, c := range liked {
		if c.CommentId == commentId {
			found = true

			// If the user had already liked the comment 
			// then it will remove the like
			if c.Value == value {
				_, err := Db.Exec(`
				DELETE FROM commentLikes 
					WHERE userId = ? 
					AND commentId = ?`, 
					userId, commentId)
				if err != nil {
					return err
				}

			// If the user has already liked the comment it will
			// dislike it and also the other way around
			} else {
				_, err := Db.Exec(`
				UPDATE commentLikes 
					SET value = ? 
					WHERE userId = ? 
					AND commentId = ?`, 
					value, userId, commentId)
				if err != nil {
					return err
				}
			}
			break
		} 
	}

	// If there was no record of the user liking the comment
	// then it will insert one into the database
	if !found {
		stmt, err := Db.Prepare("INSERT INTO commentLikes (userId, commentId, value) VALUES (?, ?, ?);")

		if err != nil {
			return err
		}
		
		defer stmt.Close()
		stmt.Exec(userId, commentId, value)
	}
	return nil
}

// Inserts a category into the database
func InsertCategory(title interface{}, userId int, isMain bool) error {
	stmt, err := Db.Prepare("INSERT INTO categories (title, userId, isMain) VALUES (?, ?, ?)")
	
	if err != nil {
		return err
	}

	
	stmt.Exec(title, userId, isMain)

	_, err = Db.Exec(`ALTER TABLE postCategory ADD COLUMN "has` + title.(string) + `" BOOLEAN NOT NULL`)

	if err != nil {
		return err
	}
	
	// stmt.Exec("has" + title.(string))

	defer stmt.Close()
	return nil
}

// `CREATE TABLE "sessions" (
// 	"sessionId" TEXT NOT NULL PRIMARY KEY,
// 	"userId" INTEGER NOT NULL UNIQUE,
// 	"roleId" INTEGER NOT NULL,
// 	"date" DATETIME NOT NULL,
// 	FOREIGN KEY ("user_id") REFERENCES "users"("user_id")
// 	FOREIGN KEY ("role_id") REFERENCES "users"("role_id")
// )`

func InsertSession(session, nickname, avatar string, userId, roleId int) error {
	stmt, err := Db.Prepare("INSERT INTO sessions (sessionId, nickname, avatar, userId, roleId, date) VALUES (?, ?, ?, ?, ?, ?)")
	
	if err != nil {
		return err
	}

	defer stmt.Close()
	stmt.Exec(session, nickname, avatar, userId, roleId, time.Now())
	return nil
}

func Notify(userId, fromUserId interface{}) error {
	stmt, err := Db.Prepare("INSERT INTO notifications (userId, fromUserId) VALUES (?, ?)")
	
	if err != nil {
		return err
	}

	defer stmt.Close()
	stmt.Exec(userId, fromUserId)
	return nil
}

func Message(senderId, targetId, message interface{}) error {
	stmt, err := Db.Prepare("INSERT INTO messages (senderId, message, targetId, date) VALUES (?, ?, ?, ?)")
	
	if err != nil {
		return err
	}

	defer stmt.Close()
	stmt.Exec(senderId, message, targetId, time.Now())
	return nil
}
