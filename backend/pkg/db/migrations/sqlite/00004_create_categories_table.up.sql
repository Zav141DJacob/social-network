-- +migrate Up
CREATE TABLE "categories" (
		"catId"		INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"title"		TEXT NOT NULL,
		"userId"	INTEGER NOT NULL,
		"isMain"	BOOLEAN NOT NULL,
		FOREIGN KEY ("userId") REFERENCES "users"("userId")
);