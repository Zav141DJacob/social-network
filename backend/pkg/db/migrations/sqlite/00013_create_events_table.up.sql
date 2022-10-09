-- +migrate Up
CREATE TABLE "events" (
		"eventId"		    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"creatorId"			INTEGER NOT NULL,
		"groupId"			INTEGER NOT NULL,
		"title"         TEXT NOT NULL,
		"description"	TEXT NOT NULL,
		"date"			DATETIME NOT NULL
);
