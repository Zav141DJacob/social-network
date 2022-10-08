import { useState, useEffect, useRef } from "react";
import styles from "./feed.module.css";
import { useAuth, userInfo , ws, wsOnMessage, wsSetup } from "../../App";
import { PostComponent } from "./post";
import { throttle } from "lodash";
import { postData } from "../Login";
import { findCookies } from "./right-sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPosts, fetchGroups } from "../../utils/queries";
import AlmostPrivateSelection from "./almostPrivateSelection";
import {ws2, ws2Setup} from './topbar'

export function Feed({
  selectedCat,
  dispatch,
  state,
  forwardRef,
  scrollValue,
}) {
  const queryClient = useQueryClient();
  const { nickname, userInfo } = useAuth();
  const [postCopy, setPostCopy] = useState();
  const [joined, setJoined] = useState(null)
  const throttler = useRef(
    throttle((newVal, ref) => ref?.current?.scroll({ top: newVal }), 40)
  );
  const {
    isLoading,
    data: posts,
    isError,
    error,
  } = useQuery(["posts"], fetchPosts);

  function join() {
    const postObj = { catId: selectedCat.postCat, nickname: nickname };
    ws.send(JSON.stringify({ ...postObj, mode: "join" }));
  }

  function unjoin() {
    const postObj = { catId: selectedCat.postCat, nickname: nickname };
    ws.send(JSON.stringify({ ...postObj, mode: "join" }));
  }

  useEffect(() => {
    if (forwardRef.current) {
      throttler.current(scrollValue, forwardRef);
    }
  });

  const { data: groups } = useQuery(["groups"], fetchGroups, {
    enabled: !!posts,
    select: (i) => i.filter((e) => e.CatId == state.postCat),
    refetchOnMount: false,
  });

  useEffect(() => {
    if (selectedCat.postCat) {
      if (groups) {
        setJoined(groups[0]?.Members?.some(i => i.UserId == userInfo.UserId))
      }
      ws.send(JSON.stringify({catId: parseInt(selectedCat.postCat), mode: "open"}))
      setPostCopy(
        posts?.filter((post) => {return post.Post.CatId == selectedCat.postCat}).reverse()
      );
    } else {
      setPostCopy(posts?.slice().reverse());
    }
  }, [posts, selectedCat]);

  if (isLoading) {
    return <div>loading</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  if (postCopy?.length > 0) {
    return (
      <div className={styles.feed} ref={forwardRef}>
        {selectedCat?.postCat && (
          <CreatePost dispatch={dispatch} state={state} />
        )}
        {selectedCat?.postCat && (
          <div className={styles.btns}>
              <button onClick={() => dispatch({ type: "inviteGroup" })} className={styles.inviteBtn} >Invite</button>
            {!joined ? <button className={styles.joinBtn} onClick={join}>Join</button> : <button className={styles.joinedBtn} onClick={unjoin}>Joined</button>}
          <button
            className={styles.groupChatBtn}
            onClick={() =>
                dispatch({
                  type: "groupChat",
                  groupChatCat: state.catName,
                  groupChatId: state.postCat,
                })
            }
          >
            <svg className={styles.groupChatBtnIcon} viewBox="0 0 24 24">
              <path d="M12 6a4 4 0 0 1 4 3 4 4 0 0 1-4 4 4 4 0 0 1-3-4 4 4 0 0 1 3-3M5 8h2c-1 2 0 3 1 4l-3 2a3 3 0 0 1-3-3 3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3 3 3 0 0 1-3 3l-3-2c1-1 2-2 1-4h2M6 18c0-2 2-3 6-3s7 1 7 3v2H6v-2m-6 2v-1c0-2 2-3 4-3v4H0m24 0h-3v-2l-1-2c2 0 4 1 4 3v1Z" />
            </svg>
            Group chat
          </button>
          </div>
        )}
        {selectedCat?.inviteGroup && (
          <div className={styles.inviteModal}>
            <div className={styles.arrowUp}></div>
            <div
              className={styles.closeModal}
              onClick={() => dispatch({ type: "inviteGroupClose" })}
            >
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                />
              </svg>
            </div>
            <span className={styles.moduleLabel}>
              Invite people to {selectedCat.catName}
            </span>
            {groups[0]?.Nonmembers &&
                groups[0]?.Nonmembers.map((follower) => {
                  return (
                    <div key={follower.UserId} className={styles.follower}>
                      {follower.Avatar && (
                        <div className={styles.followerAvatar}>
                          <img
                            className={styles.followerAvatarImg}
                            src={`http://localhost:8000/static/${follower.Avatar}`}
                          />
                        </div>
                      )}
                      <div
                        className={styles.followerNickname}
                        onClick={() =>
                            dispatch({
                              type: "profile",
                              Id: `${follower.Nickname}`,
                            })
                        }
                      >
                        {follower.Nickname}
                      </div>
                      <button className={styles.inviteUserBtn}>Invite</button>
                    </div>
                  );
                })}
          </div>
        )}
        <div className={styles.posts}>
          {postCopy?.map((i) => {
            // only summon this post when i.Post.Privacy === "public"
            if (
              i.Post.Privacy === "public" ||
              i.User === nickname ||
              i.Post.AccessList.split(",").includes(nickname)
            ) {
              return (
                <PostComponent
                  key={i?.Post?.PostId}
                  postInfo={i}
                  dispatch={dispatch}
                />
              );
            }
          })}
        </div>
      </div>
    );
  } else if (groups?.IsPublic) {
    return (
      <div className={styles.feed} ref={forwardRef}>
        <div className={styles.joinBtn}>
          <button onClick={join}>Join</button>
        </div>
        <div className={styles.posts}>
          {postCopy?.map((i) => {
            if (
              i.Post.Privacy === "public" ||
              i.User === nickname ||
              i.Post.AccessList.split(",").includes(nickname)
            ) {
              return (
                <PostComponent
                  key={i?.Post?.PostId}
                  postInfo={i}
                  dispatch={dispatch}
                />
              );
            }
          })}
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.feed} ref={forwardRef}>
        <div className={styles.posts}>
          <div className={styles.private}>
            <div className={styles.joinBtn}>
              <button onClick={join}>Join</button>
            </div>
            <div className={styles.privatebox}>
              <svg className={styles.lock} viewBox="0 0 24 24">
                <path
                  strokeWidth="0.6"
                  d="M12 17a2 2 0 1 1 0-4 2 2 0 0 1 2 2 2 2 0 0 1-2 2m6 3V10H6v10h12m0-12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3Z"
                />
              </svg>
              <span className={styles.privatetext}>This group is private</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function CreatePost({ state, dispatch }) {
  const [openDesc, setOpenDesc] = useState();
  const { nickname } = useAuth();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState();
  const [categories, setCategories] = useState([]);

  function handleTitleChange(e) {
    setTitle(e.target.value);
    return;
  }

  return (
    <div className={styles.creator}>
      <input
        className={styles.title}
        placeholder={"What do you want to post, " + nickname}
        value={title}
        onChange={handleTitleChange}
        onClick={() => setOpenDesc(true)}
      />
      {openDesc && (
        <Description
          nickname={nickname}
          state={state}
          title={title}
          value={desc}
          dispatch={dispatch}
          setDesc={setDesc}
          categories={categories}
        />
      )}
    </div>
  );
}

function Description({
  nickname,
  state,
  title,
  value,
  setDesc,
  categories,
  dispatch,
}) {
  const [visibility, setVisibility] = useState("public");
  const [selectedFile, setSelectedFile] = useState();
  const [postViewers, setPostViewers] = useState([]);

  const setViewers = (arrOfUsers) => {
    return setPostViewers([...arrOfUsers]);
  };

  function submitPost() {
    let cookieStruct = {};
    for (const i of document.cookie.split("; ")) {
      let split = i.split("=");
      cookieStruct[split[0]] = split[1];
    }
    let formData = new FormData();
    let file = selectedFile;
    formData.append("file", file);
    if (file) {
      postImg("http://localhost:8000/api/v1/upload/", formData).then((x) => {
        const postObj = {
          title: title,
          body: value,
          image: x,
          categoryId: parseInt(state.postCat),
          privacy: visibility,
          accessList: postViewers.toString(),
        };
        postData("http://localhost:8000/api/v1/posts/", postObj)
          .then((i) => dispatch({ type: "create", postId: i }))
          .catch((err) => console.log("FOUND ERROR\n", err));
      });
    } else {
      const postObj = {
        title: title,
        body: value,
        image: "none",
        categoryId: parseInt(state.postCat),
        privacy: visibility,
        accessList: postViewers.toString(),
      };
      postData("http://localhost:8000/api/v1/posts/", postObj)
        .then((i) => dispatch({ type: "create", postId: i }))
        .catch((err) => console.log("FOUND ERROR\n", err));
    }
  }
  if (title && value) {
    return (
      <>
        <div className={styles.postVisibility}>
          <div
            onClick={() => setVisibility("public")}
            className={
              visibility == "public"
                ? styles.activePostVisibility
                : styles.visBtn
            }
          >
            <svg className={styles.publicIcon} viewBox="0 0 24 24">
              <path d="m18 17-2-1h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2 8 8 0 0 1 3 12m-7 3a8 8 0 0 1-7-10l5 5v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z" />
            </svg>
            <span className={styles.publicText}>Public</span>
          </div>
          <div
            onClick={() => setVisibility("private")}
            className={
              visibility == "private"
                ? styles.activePostVisibility
                : styles.visBtn
            }
          >
            <svg className={styles.privateIcon} viewBox="0 0 24 24">
              <path d="m2 5 1-1 17 17-1 1-3-3-4 1c-5 0-9-4-11-8l3-5-2-2m10 4a3 3 0 0 1 3 3v1l-4-4h1m0-4c5 0 9 3 11 7l-4 5-1-1 3-4A10 10 0 0 0 9 7L7 5h5m-9 7a10 10 0 0 0 11 5l-2-2c-2 0-3-1-3-3L6 9l-3 3Z" />
            </svg>
            <span className={styles.privateText}>Private</span>
          </div>
          <div
            onClick={() => setVisibility("almostprivate")}
            className={
              visibility == "almostprivate"
                ? styles.activePostVisibility
                : styles.visBtn
            }
          >
            <svg className={styles.almostPrivateIcon} viewBox="0 0 24 24">
              <path d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3-9a4 4 0 1 0-4 3 4 4 0 0 0 4-3m3 5a5 5 0 0 1 2 4v2h4v-2s0-4-6-4m-1-9a3 3 0 0 0-2 1 5 5 0 0 1 0 5 3 3 0 0 0 2 1 4 4 0 0 0 0-7Z" />
            </svg>
            <span className={styles.almostPrivateText}>Almost private</span>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {visibility == "almostprivate" && (
            <AlmostPrivateSelection setViewers={setViewers} />
          )}
        </div>
        <textarea
          className={styles.description}
          value={value}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={"Please describe your thought..."}
        ></textarea>
        <div className={styles.bottomBtns}>
          <div className={styles.addImg}>
            <label className={styles.addImageBtn} htmlFor="upload">
              <svg className={styles.addImageIcon} viewBox="0 0 24 24">
                <path d="m9 14 2 3 4-5 4 6H5m16 1V5l-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z" />
              </svg>
              <span className={styles.addImageText}>Add an image</span>
            </label>
            <input
              type="file"
              id="upload"
              accept="image/jpg, image/png, image/gif"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              hidden
            />
          </div>
          <div
            className={styles.eventBtn}
            onClick={() => dispatch({ type: "createEvent" })}
          >
            <svg className={styles.eventIcon} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="m15 1-2 2 2 1v2l-3 3 1 2 3-4 1-2-1-2-1-2m-4 2L9 5h1v2H9l2 2V8l1-2-1-2V3m10 2-2 1-6 6 2 1 5-6a1 1 0 0 1 2 0l1 1 1-2h-1l-2-1M7 8 2 22l14-5-9-9m12 3-2 1-2 1 2 2 1-2a1 1 0 0 1 2 0l2 2 1-1-2-2-2-1Z"
              />
            </svg>
            <span className={styles.eventBtnText}>Create event</span>
          </div>
        </div>
        <div className={styles.submitready} onClick={submitPost}>
          Post
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.postVisibility}>
        <div
          onClick={() => setVisibility("public")}
          className={
            visibility == "public" ? styles.activePostVisibility : styles.visBtn
          }
        >
          <svg className={styles.publicIcon} viewBox="0 0 24 24">
            <path d="m18 17-2-1h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2 8 8 0 0 1 3 12m-7 3a8 8 0 0 1-7-10l5 5v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z" />
          </svg>
          <span className={styles.publicText}>Public</span>
        </div>
        <div
          onClick={() => setVisibility("private")}
          className={
            visibility == "private"
              ? styles.activePostVisibility
              : styles.visBtn
          }
        >
          <svg className={styles.privateIcon} viewBox="0 0 24 24">
            <path d="m2 5 1-1 17 17-1 1-3-3-4 1c-5 0-9-4-11-8l3-5-2-2m10 4a3 3 0 0 1 3 3v1l-4-4h1m0-4c5 0 9 3 11 7l-4 5-1-1 3-4A10 10 0 0 0 9 7L7 5h5m-9 7a10 10 0 0 0 11 5l-2-2c-2 0-3-1-3-3L6 9l-3 3Z" />
          </svg>
          <span className={styles.privateText}>Private</span>
        </div>
        <div
          onClick={() => setVisibility("almostprivate")}
          className={
            visibility == "almostprivate"
              ? styles.activePostVisibility
              : styles.visBtn
          }
        >
          <svg className={styles.almostPrivateIcon} viewBox="0 0 24 24">
            <path d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3-9a4 4 0 1 0-4 3 4 4 0 0 0 4-3m3 5a5 5 0 0 1 2 4v2h4v-2s0-4-6-4m-1-9a3 3 0 0 0-2 1 5 5 0 0 1 0 5 3 3 0 0 0 2 1 4 4 0 0 0 0-7Z" />
          </svg>
          <span className={styles.almostPrivateText}>Almost private</span>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        {visibility == "almostprivate" && (
          <AlmostPrivateSelection setViewers={setViewers} />
        )}
      </div>

      <textarea
        className={styles.description}
        value={value}
        onChange={(e) => setDesc(e.target.value)}
        placeholder={"Please describe your thought..."}
      ></textarea>
      <div className={styles.bottomBtns}>
        <div className={styles.addImg}>
          <label className={styles.addImageBtn} htmlFor="upload">
            <svg className={styles.addImageIcon} viewBox="0 0 24 24">
              <path d="m9 14 2 3 4-5 4 6H5m16 1V5l-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z" />
            </svg>
            <span className={styles.addImageText}>Add an image</span>
          </label>
          <input
            type="file"
            id="upload"
            accept="image/jpg, image/png, image/gif"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            hidden
          />
        </div>
        <div
          className={styles.eventBtn}
          onClick={() => dispatch({ type: "createEvent" })}
        >
          <svg className={styles.eventIcon} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="m15 1-2 2 2 1v2l-3 3 1 2 3-4 1-2-1-2-1-2m-4 2L9 5h1v2H9l2 2V8l1-2-1-2V3m10 2-2 1-6 6 2 1 5-6a1 1 0 0 1 2 0l1 1 1-2h-1l-2-1M7 8 2 22l14-5-9-9m12 3-2 1-2 1 2 2 1-2a1 1 0 0 1 2 0l2 2 1-1-2-2-2-1Z"
            />
          </svg>
          <span className={styles.eventBtnText}>Create event</span>
        </div>
      </div>
      <div className={styles.submit}>Post</div>
    </>
  );
}

export async function postImg(url = "", data = {}, boolean = true) {
  // Default options are marked with *
  let cookieStruct = findCookies();
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
    headers: {
      Authentication: cookieStruct.session,
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: data,
  });
  if (boolean) {
    return response.json(); // parses JSON response into native JavaScript objects
  }
  return response;
}
