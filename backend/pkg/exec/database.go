package exec

import (
	"os"
	"database/sql"	
	"forum/pkg/db/sqlite"
	_ "github.com/mattn/go-sqlite3"
)

// Deletes the old database and creates a new one
func CreateDb() error {

	// Creates the database
	database, err := os.Create("database.db")

	if err != nil {
		return err
	}

	// too lazy to figure out if I even need to close this database -Jacob
	database.Close()  

	// Opens the database
	Db, err = sql.Open("sqlite3", "./database.db")

	if err != nil {
		return err
	}

	err = CreateTables(Db)

	if err != nil {
		return err
	}
	return nil
}

// Inserts tables into the database
func CreateTables(db *sql.DB) error {
	err := sqlite.Migrate(Db)
	if err != nil {
		return err
	}
	return nil
}


