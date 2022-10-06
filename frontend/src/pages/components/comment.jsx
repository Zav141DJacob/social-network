import React from "react";
import * as timeago from "timeago.js";
import styles from "./post.module.css";

const Comment = ({ comment }) => {
  return (
    <div className={styles.comment}>
      <div className={styles.commentAuthor}>{comment.User}</div>
      <p className={styles.commentBody}>{comment.Comment.Body}</p>
      {comment?.Comment?.Image ? (
        <img src={"http://localhost:8000/static/" + comment?.Comment?.Image} />
      ) : (
        <div className="not"></div>
      )}
      <p className={styles.commentTime}>
        {timeago.format(comment.Comment.Date)}
      </p>
    </div>
  );
};

export default Comment;
