-- +migrate Up
CREATE TABLE "followers" (
    "id"                INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nickname"          TEXT NOT NULL,
    "userId"	        INTEGER NOT NULL,
    "avatar"            TEXT NOT NULL,
    "followerNickName"  TEXT NOT NULL,
    "followerUserId"    INTEGER NOT NULL,
    "followerAvatar"    TEXT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("userId")
    FOREIGN KEY ("followerUserId") REFERENCES "users"("userId")
    FOREIGN KEY ("followerAvatar") REFERENCES "users"("avatar")
);
