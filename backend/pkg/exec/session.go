package exec

import(
	"github.com/satori/go.uuid"
)

func Login(nickname interface{}) error {


	DeleteSession(nickname)

	// if err != nil {
		// HandleErr(err)
		// return err
	// }

	err := startSession(nickname)
	

	if err != nil {
		HandleErr(err)
		return err
	}

	return nil
}

func startSession(nickname interface{}) error {
	sessionToken := uuid.NewV4().String()

	user, err := FromUsers("nickname", nickname)

	if err != nil {
		return err
	}

	if len(user) == 0 {
		user, err = FromUsers("email", nickname)
		if err != nil {
			return err
		}
		// if len(user) == 0 {
		// 	return &ErrorString{"Custom error"}
		// }
	}
	
	err = InsertSession(sessionToken, user[0].Nickname, user[0].UserId, user[0].RoleId)

	if err != nil {
		return err
	}

	_, err = FromSessions("", "")
	if err != nil {
		HandleErr(err)
		return err
	}

	return nil
}
