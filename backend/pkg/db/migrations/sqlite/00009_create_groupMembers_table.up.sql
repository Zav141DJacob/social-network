-- +migrate Up
CREATE TABLE "groupMembers" (
	"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	"userId" INTEGER NOT NULL,
	"catId" INTEGER NOT NULL,
	"username" STRING NOT NULL,

	FOREIGN KEY ("userId") REFERENCES "users"("userId")
	FOREIGN KEY ("catId") REFERENCES "categories"("catId")
);
