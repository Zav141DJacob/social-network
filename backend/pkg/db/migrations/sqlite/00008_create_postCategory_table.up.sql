-- +migrate Up
CREATE TABLE "postCategory" (
    "id"            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId"        INTEGER NOT NULL,
    "catId"         INTEGER NOT NULL,
    "categoryTitle" TEXT NOT NULL,
    FOREIGN KEY ("postId") REFERENCES "posts"("postId")
    FOREIGN KEY ("catId") REFERENCES "categories"("catId")
    FOREIGN KEY ("categoryTitle") REFERENCES "categories"("title")
);