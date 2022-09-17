package exec

import(
	"github.com/satori/go.uuid"
)

func Login(nickname interface{}) error {



	// if err != nil {
		// HandleErr(err)
		// return err
	// }
	allUsers, err := FromUsers("nickname", nickname)
	if err != nil {
		HandleErr(err)
		return CreateErr("ERROR: 500 server error")
	}

	// If it cant find a nickname then look for email instead
	if len(allUsers) == 0 {

		allUsers, err = FromUsers("email", nickname)

		// If theres an error in the function FromUsers, return error
		if err != nil {
			HandleErr(err)
			return CreateErr("ERROR: 500 server error")
		}

		// If it cant find a user at all, return error
		if len(allUsers) == 0 {
			return CreateErr("Invalid nickname or password")
		} 
	}
	DeleteSession(allUsers[0].Nickname)

	err = startSession(allUsers[0].Nickname)
	

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

		// if len(user) == 
		if len(user) == 0 {
			return CreateErr("Custom error")
		}
	}
	
	err = InsertSession(sessionToken, user[0].Nickname, user[0].Avatar, user[0].UserId, user[0].RoleId)

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
