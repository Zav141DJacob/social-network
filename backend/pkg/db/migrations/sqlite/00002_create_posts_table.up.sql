-- +migrate Up
CREATE TABLE "posts" (
		"postId"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"userId"	INTEGER NOT NULL,
		"title"		TEXT NOT NULL,
		"body"		TEXT NOT NULL,
		"date"		DATETIME NOT NULL,
		FOREIGN KEY (userId) REFERENCES "users"("userId")
);