-- +migrate Up
CREATE TABLE "posts" (
		"postId"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"userId"	INTEGER NOT NULL,
		"title"		TEXT NOT NULL,
		"body"		TEXT NOT NULL,
		"image"		TEXT,
		"catId"		INTEGER NOT NULL,
		"date"		DATETIME NOT NULL,
		"privacy"   TEXT NOT NULL,
		"accessList" TEXT,
		FOREIGN KEY (userId) REFERENCES "users"("userId")
);