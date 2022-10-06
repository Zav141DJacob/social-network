-- +migrate Up
CREATE TABLE "comments" (
		"commentId"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"body"		TEXT NOT NULL,
		"postId"	INTEGER NOT NULL,
		"userId"	INTEGER NOT NULL,
		"date"		DATETIME NOT NULL,
		"image"	TEXT,
		FOREIGN KEY ("postId") REFERENCES "posts"("postId")
		FOREIGN KEY ("userId") REFERENCES "users"("userId")
);