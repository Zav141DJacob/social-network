-- +migrate Up
CREATE TABLE "sessions" (
		"sessionId" TEXT NOT NULL PRIMARY KEY,
		"nickname" TEXT NOT NULL,
		"userId" INTEGER NOT NULL UNIQUE,
		"roleId" INTEGER NOT NULL,
		"date" DATETIME NOT NULL,
		FOREIGN KEY ("nickname") REFERENCES "users"("nickname")
		FOREIGN KEY ("userId") REFERENCES "users"("userId")
		FOREIGN KEY ("roleId") REFERENCES "users"("roleId")
);