import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as timeago from "timeago.js";
import styles from "./post.module.css";
import { useAuth } from "./../../App";
import { postData as postComment } from "../Login";

export function PostComponent({ post, postInfo, dispatch, group }) {
  const [postData, setPostData] = useState();
  const [commentData, setCommentData] = useState();
  const [currentComment, setCurrentComment] = useState({
    value: "",
    rows: 3,
    minRows: 3,
    maxRows: 5,
  });

  let cookies = document.cookie;
  let output = {};
  cookies.split(/\s*;\s*/).forEach(function (pair) {
    pair = pair.split(/\s*=\s*/);
    output[pair[0]] = pair.slice(1).join("=");
  });

  useEffect(() => {
    if (post) {
      window.history.pushState("y2", "x3", `/post/${post}`);
    }
  }, [post]);
  const { nickname } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!postData) {
      if (postInfo) {
        setPostData(postInfo);
      } else {
        fetch(`http://localhost:8000/api/v1/posts/?postId=${post}`, {
          method: "GET",
          credentials: "include",
          headers: { Authentication: output.session },
        })
          .then((res) => res.json().then((i) => setPostData(i[0])))
          .catch((e) => console.log(e));
      }
    }
    if (!commentData && !postInfo) {
      fetch(`http://localhost:8000/api/v1/comments/post/${post}/`, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: { Authentication: output.session },
      }).then((res) =>
        res.json().then((i) => {
          i === null ? setCommentData([]) : setCommentData(i);
        })
      );
    }
  }, [postData, commentData, postInfo, post, output.session]);

  const closePostHandler = (e) => {
    e.stopPropagation();
    if (dispatch) {
      console.log("damn");
      nav("/");
      dispatch({ type: "unselect" });
    } else {
      nav("/");
    }
    return;
  };

  const handleCommentChange = (event) => {
    if (event.nativeEvent.inputType === "insertLineBreak") {
      let cmntCp = [...commentData];
      cmntCp.unshift({
        Comment: { CommentID: 4, Body: currentComment.value, Date: Date.now() },
        User: nickname,
      });
      let cookieStruct = {};
      for (const i of document.cookie.split("; ")) {
        let split = i.split("=");
        cookieStruct[split[0]] = split[1];
      }
      const commentObj = {
        postId: post,
        body: currentComment.value,
        userToken: cookieStruct.session,
      };
      postComment("http://localhost:8000/api/v1/comments/", commentObj).then(
        (i) => console.log(i)
      );
      setCommentData(cmntCp);
      return;
    }
    const textareaLineHeight = 23;
    const { minRows, maxRows } = currentComment;
    const previousRows = event.target.rows;
    event.target.rows = minRows; // reset number of rows in textarea
    const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

    event.target.rows = currentRows;
    if (currentRows === previousRows) {
      event.target.rows = currentRows;
    }

    if (currentRows >= maxRows) {
      event.target.rows = maxRows;
      event.target.scrollTop = event.target.scrollHeight;
    }

    setCurrentComment({
      ...currentComment,
      value: event.target.value,
      rows: currentRows < maxRows ? currentRows : maxRows,
    });
  };

  console.log(postData);
  return (
    <div className={styles.postC}>
      <div
        className={styles.postContainer}
        key={postData?.Post?.PostId}
        onClick={() =>
          dispatch({ type: "select", postId: postData?.Post?.PostId })
        }
      >
        {!postInfo && (
          <div className={styles.close} onClick={closePostHandler}>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </div>
        )}
        <span
          className={styles.author}
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: "profile", Id: `${postData?.User}` });
          }}
        >
          {postData?.User ?? timeago.format(postData?.Post?.Date)}
        </span>
        <div className={styles.title}>{postData?.Post?.Title}</div>
        {(postData?.User && (
          <p className={styles.date}>{timeago.format(postData?.Post?.Date)}</p>
        )) || <div className={styles.bottomPad}>{group}</div>}
        {!postInfo && (
          <>
            <p className={styles.desc}>{postData?.Post?.Body}</p>
          </>
        )}
      </div>
      {/* building post image - kaarel*/}
      {postData?.Post?.Image != "none" &&
        <img src={"http://localhost:8000/static/" + postData?.Post?.Image} />
      }
      {!postInfo && (
        <div className={styles.commentBox}>
          <textarea
            className={styles.commentInput}
            rows="3"
            value={currentComment.value}
            onChange={handleCommentChange}
            placeholder={"Write a comment..."}
          />
          <p className={styles.commentsLabel}>Comments</p>
          <div className={styles.comments}>
            {commentData?.map((comment) => {
              return (
                <div
                  className={styles.comment}
                  key={comment?.Comment?.CommentId}
                >
                  <div className={styles.commentAuthor}>{comment?.User}</div>
                  <p className={styles.commentBody}>{comment?.Comment?.Body}</p>
                  <p className={styles.commentTime}>
                    {timeago.format(comment?.Comment?.Date)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
