-- +migrate Up
CREATE TABLE "groupMessages" (
		"messageId"		INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"senderId"		INTEGER NOT NULL,
		"senderName"	TEXT NOT NULL,
		"message"		TEXT NOT NULL, 
		"targetId"		INTEGER NOT NULL,
		"date"			DATETIME NOT NULL,
		FOREIGN KEY ("senderId") REFERENCES "users"("userId")
		FOREIGN KEY ("targetId") REFERENCES "categories"("catId")
);