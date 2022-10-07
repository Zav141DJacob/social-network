import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as timeago from "timeago.js";
import styles from "./post.module.css";
import { queryClient, useAuth, ws, wsOnMessage, wsSetup } from "./../../App";
import { postData as postComment } from "../Login";
import { postImg } from "./feed";
import Comment from "./comment.jsx";
import {useQuery, useMutation} from '@tanstack/react-query'
import {fetchPost, fetchPostComments} from '../../utils/queries'

const addComment = (newComment) => {
  return postComment("http://localhost:8000/api/v1/comments/", newComment, false)
}
  
export function PostComponent({ post, postInfo, dispatch, group }) {
  const [postData, setPostData] = useState();
  const [currentComment, setCurrentComment] = useState({
    value: "",
    rows: 3,
    minRows: 3,
    maxRows: 5,
  });
  //image file from "add comment"
  const [selectedFile, setSelectedFile] = useState(undefined);
  const { nickname } = useAuth();
  const nav = useNavigate();
  const {isLoading, data: postFetch, isError} = useQuery(["post", post], fetchPost, {
    enabled: !postInfo && !postData
  })
  const {data: commentData} = useQuery(["comments", post], fetchPostComments, {
    enabled: !!post,
    initialData: () => {return []}
  })
  const {mutate: insertNewComment} = useMutation(addComment, {
    onSuccess: () => queryClient.invalidateQueries("comments"),
  }
  )

  useEffect(() => {
    if (post) {
      window.history.pushState("y2", "x3", `/post/${post}`);
    }
  }, [post]);



  useEffect(() => {
  if (postInfo && !postData) {
    setPostData(postInfo)
  } else if (!postData && postFetch){
    setPostData(postFetch[0])
  }
  }, [postData, postFetch, postInfo]);

  const closePostHandler = (e) => {
    e.stopPropagation();
    if (dispatch) {
      nav("/");
      dispatch({ type: "unselect" });
    } else {
      nav("/");
    }
    return;
  };

  const onClick = (e) => {
    e.preventDefault();
    let cmntCp
    if (commentData) {
      cmntCp = [
        ...commentData,
        {
          Comment: {
            CommentID: 4,
            Body: currentComment.value,
            Date: Date.now(),
            Image: "",
          },
          User: nickname,
        },
      ];
    } else {
      cmntCp = [
        {
          Comment: {
            CommentID: 4,
            Body: currentComment.value,
            Date: Date.now(),
            Image: "",
          },
          User: nickname,
        },
      ]
    }

    let cookieStruct = {};
    for (const i of document.cookie.split("; ")) {
      let split = i.split("=");
      cookieStruct[split[0]] = split[1];
    }

    const commentObj = {
      postId: post,
      body: currentComment.value,
      userToken: cookieStruct.session,
      image: "",
    };

    if (selectedFile !== undefined) {
      let formData = new FormData();
      let file = selectedFile;
      formData.append("file", file);
      postImg("http://localhost:8000/api/v1/upload/", formData)
        .then((res) => {
          cmntCp[cmntCp.length - 1].Comment.Image = res;
          commentObj.image = res;
        })
        .then(() => {
          insertNewComment(commentObj)
          setSelectedFile();
        });
    } else {
      insertNewComment(commentObj)
    }
  };

  const handleCommentChange = (event) => {
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
  if (isLoading && !postData) {
    return <div>Loading...</div>
  }

  if (postData) {
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
          {postData?.Post?.Image != "none" &&
              postData?.Post?.Image && <img className={styles.postImg} src={"http://localhost:8000/static/" + postData?.Post?.Image} />
          }
        </div>
        {/* building post image - kaarel*/}
        {!postInfo && (
          <>
            <p className={styles.desc}>{postData?.Post?.Body}</p>
          </>
        )}
        {postData?.Post?.Image != "none" && postData?.Post?.Image && (
          <img
            className={styles.postImg}
            src={"http://localhost:8000/static/" + postData?.Post?.Image}
          />
        )}
      </div>
      {/* building post image - kaarel*/}
      {!postInfo && (
        <div className={styles.commentBox}>
          <textarea
            className={styles.commentInput}
            rows="3"
            value={currentComment.value}
            onChange={handleCommentChange}
            placeholder={"Write a comment..."}
          />
          <div className={styles.addImg}>
            <label className={styles.addImageBtn} htmlFor="upload">
              {!selectedFile ? (
                <span className={styles.addImageText}>Add an image</span>
              ) : (
                <span className={styles.addImageText}>Image added</span>
              )}
            </label>
            <input
              type="file"
              id="upload"
              accept="image/jpg, image/png, image/gif"
              onChange={(e) => {
                setSelectedFile(e.target.files[0]);
              }}
              hidden
            />
            <div className={styles.addImg}>
              <label className={styles.addImageBtn} htmlFor="upload">
                {!selectedFile ? (
                  <span className={styles.addImageText}>Add an image</span>
                ) : (
                  <span className={styles.addImageText}>Image added</span>
                )}
              </label>
              <input
                type="file"
                id="upload"
                accept="image/jpg, image/png, image/gif"
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                }}
                hidden
              />
              <button type="submit" onClick={onClick}>
                Hear me!
              </button>
            </div>
            <p className={styles.commentsLabel}>Comments</p>

          <div className={styles.comments}>
            {commentData
              ?.slice(0)
                .reverse()
                .map((comment) => {
                  return (
                    <Comment comment={comment} key={comment.Comment.CommentId} />
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
  }
}
