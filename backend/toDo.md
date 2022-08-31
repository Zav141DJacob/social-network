1. sort out files
2. add migrations into backend folder (*done*)
//https://github.com/golang-migrate/migrate
//https://pkg.go.dev/github.com/rubenv/sql-migrate

3. image and gif storage into database
4. follower endpoint
5. group event
6. group chat

7. following request notification
8. group invitation notification
9. group join request notification
10. group event notification


Add Likes (*optional*)
	// `CREATE TABLE "postLikes" (
	// 	"userId"	INTEGER NOT NULL,
	// 	"postId"	INTEGER NOT NULL,
	// 	"value" 	INTEGER NOT NULL,
	// 	CHECK ("value" = 1 OR "value" = -1)
	// 	CONSTRAINT postLike_PK PRIMARY KEY(userId, postId)
	// )`,

	// `CREATE TABLE "commentLikes" (
	// 	"userId"	INTEGER NOT NULL,
	// 	"commentId"	INTEGER NOT NULL,
	// 	"value"		INTEGER NOT NULL,
	// 	CHECK ("value" = 1 OR "value" = -1)
	// 	CONSTRAINT commentLike_PK PRIMARY KEY(userId, commentId)
	// )`


