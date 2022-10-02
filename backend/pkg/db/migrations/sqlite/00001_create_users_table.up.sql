-- +migrate Up
CREATE TABLE "users" (
		"userId"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"nickname"	TEXT NOT NULL UNIQUE,
		"email"		TEXT NOT NULL UNIQUE,
		"password"	TEXT NOT NULL,
		"firstName"	TEXT NOT NULL,
		"lastName"	TEXT NOT NULL,
		"age"		TEXT NOT NULL,
		"bio"		TEXT NOT NULL,
		"avatar"	TEXT NOT NULL,
		"roleId"	INTEGER NOT NULL,
		"date"		DATETIME NOT NULL,
		"isPrivate" BOOLEAN NOT NULL
);
