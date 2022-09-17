package exec

import (
  "net/mail"
  // "fmt"
  "golang.org/x/crypto/bcrypt"
)

//  ╭──────────────────────────────────────────────────────────╮
//  │ type ResponseRegisterUser struct {                       │
//  │ 	Email           string                                 │
//  │ 	nickname        string                                 │
//  │ 	Password        string                                 │
//  │ 	ConfirmPassword string                                 │
//  │ 	FirstName       string                                 │
//  │ 	LastName        string                                 │
//  │ 	Age             string                                 │
//  │ }                                                        │
//  ╰──────────────────────────────────────────────────────────╯
// Checks if login data is correct

func AuthLogin(nickname, password interface{}) (bool, string) {

	allUsers, err := FromUsers("nickname", nickname)
	if err != nil {
		HandleErr(err)
		return false, "ERROR: 500 server error"
	}

	// If it cant find a nickname then look for email instead
	if len(allUsers) == 0 {

		if len(allUsers) == 0 {
			return false, "Invalid nickname or password"
		} 
		// ToDo: allow for email login
		allUsers, err = FromUsers("email", nickname)

		// If theres an error in the function FromUsers, return error
		if err != nil {
			HandleErr(err)
			return false, "ERROR: 500 server error"
		}

		// If it cant find a user at all, return error
		if len(allUsers) == 0 {
			return false, "Invalid nickname or password"
		} 
	}

	// Compares the password and the hash
	err = bcrypt.CompareHashAndPassword([]byte(allUsers[0].Password), []byte(password.(string)))
	
	// If err is empty then it can log the user into the site
	if err == nil {
		return true, "all gucci"
	}

	return false, "Invalid nickname or password"
}


// Checks if the register info is correct
func AuthRegister(nickname, email, password, firstName, lastName, age, bio, avatar interface{}) (ResponseRegisterUser) {
  
  	respUser := ResponseRegisterUser{}	

	// checks for nickname
	allUsers, err := FromUsers("nickname", nickname)
	
	// if FromUser function returns an error then show the error 500
	if err != nil {
		HandleErr(err)
    
		return ResponseRegisterUser{}
	}

  
	// if nickname length is less than 4, return error string
	if len(nickname.(string)) < 4 {
    	respUser.Nickname = "nickname error"
    }

	// if email address is not valid, return error string
	_, err = mail.ParseAddress(email.(string))
	if err != nil {
    	respUser.Email = "Please insert valid email"
	}

	// if nickname is in use, return false
	if len(allUsers) != 0 {
    	respUser.Nickname = "nickname already in use"
	}

	allUsers, err = FromUsers("email", email)

	// if FromUsers function returns an error, return error string
	if err != nil {
		HandleErr(err)
    	return ResponseRegisterUser{} //"ERROR: 500, server error"
	}

	// if email is in use, return false
	if len(allUsers) != 0 {
		respUser.Email = "Email already in use"
	}

	// if password length is less than 8, return false
	if len(password.(string)) < 8 {
    	respUser.Password = "Password is too short (min 8 characters)"
	}

	return respUser
}

func AuthenticateSession(header []string) SessionData {
  var authId string
  if len(header) == 0 {
		return SessionData{}
	}
	authId = header[0]
	session, err := FromSessions("sessionId", authId)

	if err != nil {
		HandleErr(err)
		return SessionData{}
	}

	if len(session) == 0 {
		return SessionData{}
	}

	return session[0]
}
