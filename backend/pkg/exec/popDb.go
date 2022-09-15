package exec

// Populate Database

import(
	"errors"
)

func All() error {
	err := posts()
	if err != nil {
		return err
	}
	err = users()
	if err != nil {
		return err
	}
	err = comments()
	if err != nil {
		return err
	}
	// err = postLikes()
	// if err != nil {
	// 	return err
	// }
	// err = commentLikes()
	// if err != nil {
	// 	return err
	// }
	err = messages()
	if err != nil {
		return err
	}
	return nil
}

// user, category, title, body
// 
func posts() error{
	// interfaceArr := make([]interface{}, 1)
	err := Post(1, []interface{}{float64(1)}, "this is a test1 post", "this is the body of the test1")
	if err != nil {
		return errors.New("ERROR in post: " + err.Error())
	}
	Post(2, []interface{}{float64(1)}, "this is a test2 post from Kertu", "this is the body of the test2 from Kertu")
	Post(1, []interface{}{float64(2)}, "I am posting into Javascript", "Javascript is a great language!")
	Post(2, []interface{}{float64(1), float64(2), float64(3)}, "Kertu is posting into everything", "I dont like Javascript :(")
	return nil
}

// nickname, email, password, firstName, lastName, age 
func users() error {
	err := Register("Jacob", "jaagup.tomingas@gmail.com", "q1w2e3r4t5y6", "Jaagup", "Tomingas", "20", "jacob.png")
	if err != nil {
		return errors.New("ERROR in users: " + err.Error())
	}
	Register("Kertu", "kertu.saul@gmail.com", "q1w2e3r4t5y6", "Kertu", "Saul", "22", "kertu.png")
	Register("Alex", "alex.viik@gmail.com", "q1w2e3r4t5y6", "Alex", "Viik", "28", "alex.png")
	return nil
}

// body, postId, userId
func comments() error {
	err := Comment("This is a test1 comment", 1, 1)
	if err != nil {
		return errors.New("ERROR in comments: " + err.Error())
	}
	Comment("This is a test2 comment from Kertu", 1, 2)
	Comment(":(", 4, 1)
	return nil
}

func postLikes() error {
	err := LikePost(1, 1, 1)
	if err != nil {
		return errors.New("ERROR in postLikes: " + err.Error())
	}
	return nil
}

func commentLikes() error {
	err := LikeComment(1, 1, 1)
	if err != nil {
		return errors.New("ERROR in commentLikes: " + err.Error())
	}
	return nil 
}

func Categories() error {
	err := InsertCategory("Golang")
	if err != nil {
		return errors.New("ERROR in categories: " + err.Error())
	}
	InsertCategory("Javascript")
	InsertCategory("Rust")
	return nil
}

func messages() error {
	err := Message(1, 2, "Message to kertu!")
	if err != nil {
		return errors.New("ERROR in messages: " + err.Error())
	}
	Message(3, 1, "Message to jacob! from Alex.")

	Message(2, 1, "Message to jacob!")

	return nil
}
