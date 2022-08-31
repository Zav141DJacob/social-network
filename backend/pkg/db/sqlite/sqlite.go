package sqlite

import (
	"log"
	"database/sql"
	"github.com/rubenv/sql-migrate"
)

func Migrate(db *sql.DB) error {
	migrations := &migrate.FileMigrationSource{
		Dir: "pkg/db/migrations/sqlite",
	}

	n, err := migrate.Exec(db, "sqlite3", migrations, migrate.Up)
	if err != nil {
		// Handle errors!
		return err
	}
	log.Printf("Applied %d migrations!\n", n)
	return nil
}

// func CreatePostCategory(db *sql.DB, GetCategoryNames func()([]string, error)) error {
// 	categories, err := GetCategoryNames()
// 	if err != nil {
// 		return err
// 	}
// 	var categoryListString string
// 	for _, category := range categories {
// 		categoryListString += `"` + category + `" BOOLEAN NOT NULL,
// 		` 
// 	}

// 	postCategory := 
// 	`CREATE TABLE "postCategory" (
// 		"postId" INTEGER NOT NULL PRIMARY KEY,
// 		` + categoryListString[:len(categoryListString) - 3] + `
// 		FOREIGN KEY ("postId") REFERENCES "post"("postId")
// 	)` 

// 	table, err := db.Prepare(postCategory)

// 	if err != nil {
// 		return err
// 	}

// 	defer table.Close()
// 	table.Exec()
// 	return nil
// }