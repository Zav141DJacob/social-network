-- +migrate Up
CREATE TABLE "postCategory" (
    "postId" INTEGER NOT NULL PRIMARY KEY,
    FOREIGN KEY ("postId") REFERENCES "posts"("postId")
);