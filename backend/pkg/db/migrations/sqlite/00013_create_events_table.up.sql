-- +migrate Up
CREATE TABLE "events" (
		"Id"		    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"title"         TEXT NOT NULL,
		"description"	TEXT NOT NULL,
		"date"			DATETIME NOT NULL
);