package exec

import (
	"fmt"
	// "forum/pkg/header"
	"database/sql"
)

// SPECIAL ToDo:
//	add a length check to all "From..()" functions

func FromUsers(condition string, value interface{}) ([]UserData, error) {

	rows, err := doRows("users", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var returnUser []UserData

	for rows.Next() {
		var user UserData

		err = rows.Scan(
			&user.UserId,
			&user.Nickname,
			&user.Email,
			&user.Password,
			&user.FirstName,
			&user.LastName,
			&user.Age,
			&user.Bio,
			&user.Avatar,
			&user.RoleId,
			&user.Date,
			&user.IsPrivate)

		if err != nil {
			fmt.Println("API168", err)
			return nil, err
		}

		returnUser = append(returnUser, user)
	}

	return returnUser, nil
}

func FromPosts(condition string, value interface{}) ([]PostData, error) {
	rows, err := doRows("posts", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var returnPost []PostData

	for rows.Next() {
		var post PostData

		err = rows.Scan(
			&post.PostId,
			&post.UserId,
			&post.Title,
			&post.Body,
			&post.Image,
			&post.CatId,
			&post.Date,
			&post.Privacy,
			&post.AccessList)

		if err != nil {
			return nil, err
		}

		returnPost = append(returnPost, post)
	}

	return returnPost, nil
}

func FromPostCategory(condition string, value interface{}) ([]PostCategoryData, error) {
	rows, err := doRows("postCategory", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	// catNames := GetCategoryNames()

	var returnPostCat []PostCategoryData

	for rows.Next() {
		var postCategory PostCategoryData

		err = rows.Scan(
			&postCategory.Id,
			&postCategory.PostId,
			&postCategory.CatId,
			&postCategory.CategoryTitle,
		)

		if err != nil {
			return nil, err
		}

		returnPostCat = append(returnPostCat, postCategory)
	}

	return returnPostCat, nil
}

func FromComments(condition string, value interface{}) ([]CommentData, error) {
	rows, err := doRows("comments", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var returnComment []CommentData

	for rows.Next() {
		var comment CommentData

		err = rows.Scan(
			&comment.CommentId,
			&comment.Body,
			&comment.PostId,
			&comment.UserId,
			&comment.Date,
			&comment.Image)

		if err != nil {
			return nil, err
		}

		returnComment = append(returnComment, comment)
	}

	return returnComment, nil
}

func FromCategories(condition string, value interface{}) ([]CategoryData, error) {
	rows, err := doRows("categories", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var returnCategory []CategoryData

	for rows.Next() {
		var category CategoryData

		err = rows.Scan(
			&category.CatId,
			&category.Title,
			&category.Description,
			&category.UserId,
			&category.IsPublic)

		if err != nil {
			return nil, err
		}

		returnCategory = append(returnCategory, category)
	}

	return returnCategory, nil
}

func FromPLikes(condition string, value interface{}) ([]PLikeData, error) {
	rows, err := doRows("postLikes", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	//return post likes
	var returnPLikes []PLikeData

	for rows.Next() {
		var postLike PLikeData

		err = rows.Scan(
			&postLike.UserId,
			&postLike.PostId,
			&postLike.Value)

		if err != nil {
			return nil, err
		}

		returnPLikes = append(returnPLikes, postLike)
	}

	return returnPLikes, nil
}

func FromCLikes(condition string, value interface{}) ([]CLikeData, error) {
	rows, err := doRows("commentLikes", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	//return comment likes
	var returnCLikes []CLikeData

	for rows.Next() {
		var commentLike CLikeData

		err = rows.Scan(
			&commentLike.UserId,
			&commentLike.CommentId,
			&commentLike.Value)

		if err != nil {
			return nil, err
		}

		returnCLikes = append(returnCLikes, commentLike)
	}

	return returnCLikes, nil
}

func FromSessions(condition string, value interface{}) ([]SessionData, error) {

	rows, err := doRows("sessions", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var returnSession []SessionData
	for rows.Next() {
		var session SessionData

		err = rows.Scan(
			&session.SessionId,
			&session.Nickname,
			&session.Avatar,
			&session.UserId,
			&session.RoleId,
			&session.Date)

		if err != nil {
			return nil, err
		}

		returnSession = append(returnSession, session)
	}

	return returnSession, nil
}

func FromGroupMembers(condition string, value interface{}) ([]GroupMembersData, error) {
	rows, err := doRows("groupMembers", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var returnGroupMembers []GroupMembersData
	for rows.Next() {
		var groupMembers GroupMembersData

		err = rows.Scan(
			&groupMembers.Id,
			&groupMembers.UserId,
			&groupMembers.CatId,
      &groupMembers.Username)

		if err != nil {
			return nil, err
		}

		returnGroupMembers = append(returnGroupMembers, groupMembers)
	}

	return returnGroupMembers, nil
}

// `CREATE TABLE "notifications" (
// 	"notificationId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
// 	"userId" INTEGER NOT NULL,
// 	"fromUserId" INTEGER NOT NULL,
// 	FOREIGN KEY ("userId") REFERENCES "users"("userId")
// 	FOREIGN KEY ("fromUserId") REFERENCES "users"("userId")
// )`,

func FromNotifications(condition string, value interface{}) ([]NotificationData, error) {

	rows, err := doRows("notifications", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var returnNotification []NotificationData
	for rows.Next() {
		var notification NotificationData

		err = rows.Scan(
			&notification.NotificationId,
			&notification.UserId,
			&notification.FromUserId)

		if err != nil {
			return nil, err
		}

		returnNotification = append(returnNotification, notification)
	}

	return returnNotification, nil
}

func FromNotificationsList(condition string, value interface{}) ([]NotificationsListData, error) {

	rows, err := doRows("notificationsList", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var returnNotification []NotificationsListData
	for rows.Next() {
		var notification NotificationsListData

		err = rows.Scan(
			&notification.Id,
			&notification.UserId,
			&notification.Nickname,
			&notification.UserAvatar,
			&notification.TargetId,
			&notification.TargetName,
			&notification.CatId,
			&notification.CategoryTitle,
			&notification.Type,
			&notification.EventId,
			&notification.EventTitle,
      )

		if err != nil {
			return nil, err
		}

		returnNotification = append(returnNotification, notification)
	}

	return returnNotification, nil
}

func FromMessages(senderValue, targetValue interface{}) ([]MessageData, error) {

	var rows *sql.Rows
	var stmt *sql.Stmt
	var err, err2 error

	switch senderValue {

	// No condition
	case "":
		if targetValue != "" {
			stmt, err = Db.Prepare(
				"SELECT * FROM messages WHERE targetId = ? OR senderId = ?",
			)
			rows, err2 = stmt.Query(targetValue, targetValue)
		}
	// With condition
	default:
		switch targetValue {
		case "":
			stmt, err = Db.Prepare(
				"SELECT * FROM messages WHERE senderId = ? OR targetId = ?",
			)
			rows, err2 = stmt.Query(senderValue, senderValue)

		default:
			stmt, err = Db.Prepare(
				"SELECT * FROM messages WHERE (senderId = ? AND targetId = ?) OR (senderId = ? AND targetId = ?)",
			)
			rows, err2 = stmt.Query(senderValue, targetValue, targetValue, senderValue)
		}
	}

	if err != nil {
		return nil, err
	}

	if err2 != nil {
		return nil, err2
	}

	if stmt == nil || rows == nil {
		stmt, err = Db.Prepare(
			"SELECT * FROM messages",
		)
		rows, err2 = stmt.Query()
	}

	if err != nil {
		return nil, err
	}

	if err2 != nil {
		return nil, err2
	}

	defer rows.Close()

	var returnMessage []MessageData
	for rows.Next() {
		var message MessageData

		err = rows.Scan(
			&message.MessageId,
			&message.SenderId,
			&message.SenderName,
			&message.Message,
			&message.TargetId,
			&message.Date)

		if err != nil {
			return nil, err
		}

		returnMessage = append(returnMessage, message)
	}

	return returnMessage, nil
}

func FromFollowers(condition string, value interface{}) ([]FollowerData, error) {
	rows, err := doRows("followers", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var returnFollowers []FollowerData
	for rows.Next() {
		var follower FollowerData

		err = rows.Scan(
			&follower.Id,
			&follower.Nickname,
			&follower.UserId,
			&follower.Avatar,
			&follower.FollowerNickname,
			&follower.FollowerUserId,
			&follower.FollowerAvatar)

		if err != nil {
			return nil, err
		}

		returnFollowers = append(returnFollowers, follower)
	}

	return returnFollowers, nil
}

func FromGroupMessages(condition string, value interface{}) ([]GroupMessageData, error) {

	rows, err := doRows("groupMessages", condition, value)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var returnMessage []GroupMessageData
	for rows.Next() {
		var message GroupMessageData

		err = rows.Scan(
			&message.MessageId,
			&message.SenderId,
			&message.SenderName,
			&message.Message,
			&message.TargetId,
			&message.Date)

		if err != nil {
			return nil, err
		}

		returnMessage = append(returnMessage, message)
	}

	return returnMessage, nil
}

func FromEvents(condition string, value interface{}) ([]EventData, error) {
  rows, err := doRows("events", condition, value)

  if err != nil {
    return nil, err
  }

  defer rows.Close()

  var returnEvents []EventData
  for rows.Next() {
    var event EventData

    err = rows.Scan(
      &event.EventId,
      &event.CreatorId,
      &event.GroupId,
      &event.Title,
      &event.Description,
      &event.Date)

    if err != nil {
      return nil, err
    }

    returnEvents = append(returnEvents, event)
  }
  return returnEvents, nil
}

func FromEventAttendees(condition string, value interface{}) ([]EventAttendeesData, error) {
  rows, err := doRows("eventAttendees", condition, value)

  if err != nil {
    return nil, err
  }

  defer rows.Close()

  var returnEventAttends []EventAttendeesData
  for rows.Next() {
    var attends EventAttendeesData
    err = rows.Scan(
		&attends.Id,
		&attends.UserId,
		&attends.EventId,
		&attends.Going,
	)

    if err != nil {
      return nil, err
    }

    returnEventAttends = append(returnEventAttends, attends)
  }
  return returnEventAttends, nil
}
// Pulls data from the database
// SELECT - how many arguments (* for all)
// FROM	  - from where you pull data from
// condition, value - "WHERE condition = value"
func doRows(FROM, condition string, value interface{}) (*sql.Rows, error) {
  var rows *sql.Rows
  var err error

	// Check if there is a condition
	switch condition {

	// No condition
	case "":
		rows, err = Db.Query("SELECT * FROM " + FROM)

	// With condition
	default:
		rows, err = Db.Query("SELECT * FROM "+FROM+" WHERE "+condition+" = $1", value)

	}

	if err != nil {
		return nil, err
	}

	return rows, nil
}
