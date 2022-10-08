package exec

// Populate Database

import (
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
	err = follows()
	if err != nil {
		return err
	}
	return nil
}

// user, category, title, body
//
func posts() error {
	// interfaceArr := make([]interface{}, 1)
	err := Post(1, 1, "this is a test1 post", "this is the body of the test1", "test-image.png", "public", "")
	if err != nil {
		return errors.New("ERROR in post: " + err.Error())
	}
	Post(2, 1, "this is a test2 post from Kertu", "this is the body of the test2 from Kertu", "test-image.png", "public", "")
	Post(1, 2, "I am posting into Javascript", "Javascript is a great language!", "test-image.png", "public", "")
	Post(2, 3, "Kertu is posting into RuS!", "I dont like Rust :(", "test-image.png", "public", "")
	return nil
}

// nickname, email, password, firstName, lastName, age
func users() error {
	err := Register("Jacob", "jaagup.tomingas@gmail.com", "q1w2e3r4t5y6", "Jaagup", "Tomingas", "20", "Backend guy", "jacob.png")
	if err != nil {
		return errors.New("ERROR in users: " + err.Error())
	}
	Register("Kertu", "kertu.saul@gmail.com", "q1w2e3r4t5y6", "Kertu", "Saul", "22", "CTRL+F", "kertu.png")
	Register("Alexxx", "alex.viik@gmail.com", "aaaaaaaa", "Alex", "Viik", "28", "Wowwww123123", "alex.png")
	Register("testuser", "test.user@gmail.com", "testuser", "test", "user", "22", "testuser", "default-avatar.png")
	return nil
}

// body, postId, userId
func comments() error {
	err := Comment("This is a test1 comment", 1, 1, "test-image.png")
	if err != nil {
		return errors.New("ERROR in comments: " + err.Error())
	}
	Comment("This is a test2 comment from Kertu", 1, 2, "test-image.png")
	Comment(":(", 4, 1, "test-image.png")
	return nil
}

func Categories() error {
	err := InsertCategory("Golang", "For all of your Golang needs!", 0, true)
	if err != nil {
		return errors.New("ERROR in categories: " + err.Error())
	}
	InsertCategory("Javascript", "For all of your Javascript wants!", 0, true)
	InsertCategory("Rust", "For all of your Rust requirements!", 0, true)
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

func follows() error {
	err := Follow(3, 2)
	if err != nil {
		return errors.New("ERROR in follow: " + err.Error())
	}
	// Follow(1, 3)

	// Follow(2, 1)

	// Follow(3, 1)

	// Follow(3, 2)

	return nil
}
