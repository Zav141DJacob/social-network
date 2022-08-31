-- +migrate Up
CREATE TABLE "notifications" (
		"notificationId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"userId" INTEGER NOT NULL,
		"fromUserId" INTEGER NOT NULL,
		FOREIGN KEY ("userId") REFERENCES "users"("userId")
		FOREIGN KEY ("fromUserId") REFERENCES "users"("userId")
);