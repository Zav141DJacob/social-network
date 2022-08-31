-- +migrate Up
CREATE TABLE "categories" (
		"catId"		INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"title"		TEXT NOT NULL
);