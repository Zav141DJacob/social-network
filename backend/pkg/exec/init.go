package exec

import(
	// "forum/pkg/db/sqlite"
	"database/sql"
)

// Change this to false if you dont want to replace
// the current database with a fresh one
var makeDb = true

// Use this in other files
// to prepare and execute statements
var Db *sql.DB

func Initialize() error{
	var err error
	if makeDb {
		err = CreateDb()
		if err != nil {
			return err
		}
		err = Categories()
		if err != nil {
			return err
		}
		err = All()
		if err != nil {
			return err
		}
	} else {
		Db, err = sql.Open("sqlite3", "./database.db")

		if err != nil {
			return err
		}
	}	
	return nil
}