-- +migrate Up
CREATE TABLE "messages" (
		"messageId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"senderId" INTEGER NOT NULL,
		"message" TEXT NOT NULL, 
		"targetId" INTEGER NOT NULL,
		"date" DATETIME NOT NULL,
		FOREIGN KEY ("senderId") REFERENCES "users"("userId")
		FOREIGN KEY ("targetId") REFERENCES "users"("userId")
);