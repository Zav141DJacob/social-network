-- +migrate Up
CREATE TABLE "eventAttendees" (
	"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	"userId" INTEGER NOT NULL,
	"eventId" INTEGER NOT NULL,
	"going" INTEGER NOT NULL,

	FOREIGN KEY ("userId") REFERENCES "users"("userId")
	FOREIGN KEY ("eventId") REFERENCES "events"("eventId")
);
