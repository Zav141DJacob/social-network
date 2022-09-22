-- +migrate Up
CREATE TABLE "notificationsList" (
	"id" 		 INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	"userId"	 INTEGER NOT NULL,
	"userAvatar" TEXT NOT NULL,
	"targetId"	 INTEGER NOT NULL,
	"catId"	 	 INTEGER NOT NULL,
	"type"		 TEXT NOT NULL,
	FOREIGN KEY ("catId") REFERENCES "categories"("catId")
	FOREIGN KEY ("userId") REFERENCES "users"("userId")
	FOREIGN KEY ("targetId") REFERENCES "users"("userId")
);