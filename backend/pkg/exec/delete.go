package exec

import (

)

func DeleteNotification(userId, fromUserId interface{}) error {

	stmt, err := Db.Prepare("DELETE FROM notifications WHERE userId = ? AND fromUserId = ?")

	if err != nil {
		// HandleErr(err)
		return err
	}

	_, err = stmt.Exec(userId, fromUserId)

	if err != nil {
		// HandleErr(err)
		return err
	}

	return nil
}


func DeleteSession(nickname interface{}) error {
	
	_, err := Db.Exec("DELETE FROM sessions WHERE nickname = $1", nickname)

	if err != nil {
		// HandleErr(err)
		return err
	}

	return nil
}

func UnFollow(userId, FollowerUserId interface{}) error {
	stmt, err := Db.Prepare("DELETE FROM followers WHERE userId = ? AND followerUserId = ?")

	if err != nil {
		// HandleErr(err)
		return err
	}

	_, err = stmt.Exec(userId, FollowerUserId)

	if err != nil {
		// HandleErr(err)
		return err
	}

	return nil
}

func DeleteNotificationsList(id interface{}) error {

	stmt, err := Db.Prepare("DELETE FROM notificationsList WHERE id = ?")

	if err != nil {
		// HandleErr(err)
		return err
	}

	_, err = stmt.Exec(id)

	if err != nil {
		return err
	}

	return nil
}