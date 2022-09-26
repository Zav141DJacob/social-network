import { useState, useEffect, useRef } from 'react'
import styles from './feed.module.css'
import {useAuth} from './../../App'
import { PostComponent } from './post'
import {throttle} from 'lodash'
import { postData } from '../Login'
import {findCookies} from './right-sidebar'

// async function postData(url = '', data = {}) {
//   // Default options are marked with *
//   const response = await fetch(url, {
//     method: 'POST',
//     mode: 'cors',
//     cache: 'no-cache',
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     redirect: 'follow', 
//     referrerPolicy: 'no-referrer', 
//     body: JSON.stringify(data) 
//   });
//   return response.json(); // parses JSON response into native JavaScript objects
// }

export function Feed({selectedCat, dispatch, state, forwardRef, scrollValue}) {
  const [posts, setPosts] = useState()
  const throttler = useRef(throttle((newVal, ref) => ref?.current?.scroll({top: newVal}), 40))
  const [postCopy, setPostCopy] = useState()
  let cookies = document.cookie
  let output = {};
  cookies.split(/\s*;\s*/).forEach(function(pair) {
    pair = pair.split(/\s*=\s*/);
    output[pair[0]] = pair.slice(1).join('=');
  });
  useEffect(() => {
    if (!posts) {
      fetch(`http://localhost:8000/api/v1/posts/`, {
        method: "GET", 
        mode:'cors', 
        cache:"no-cache", 
        credentials:"include", 
        headers: {Authentication: output.session}})
        .then(res => res.json().then(i => setPosts(i)))
    }
    if (forwardRef.current) {
      throttler.current(scrollValue, forwardRef)
    }
  })

  useEffect(() => {
    if (selectedCat.postCat) {
      setPostCopy(posts?.filter(post => post.Post.CatId == selectedCat.postCat))
    } else {
      setPostCopy(posts?.slice())
    }
  }, [posts, selectedCat])
  if (postCopy?.length > 0) {
    console.log(selectedCat)
    return (
      <div className={styles.feed} ref={forwardRef}>
        {selectedCat?.postCat && <CreatePost dispatch={dispatch} state={state}/>}
        <div className={styles.posts} >
          {postCopy?.map(i => <PostComponent key={i?.Post?.PostId} postInfo={i} dispatch={dispatch}/>)}
        </div>
      </div>
    )
  } else if (state.public === undefined) {
    return (
      <div className={styles.feed} ref={forwardRef}>
        <div className={styles.posts}>
          {postCopy?.map(i => <PostComponent key={i?.Post?.PostId} postInfo={i} dispatch={dispatch}/>)}
        </div>
      </div>
    )
  } else {
    return (
      <div className={styles.feed} ref={forwardRef}>
        <div className={styles.posts} >
          <div className={styles.private}>
            <div className={styles.privatebox}>
              <svg className={styles.lock} viewBox="0 0 24 24">
                <path strokeWidth="0.6"  d="M12 17a2 2 0 1 1 0-4 2 2 0 0 1 2 2 2 2 0 0 1-2 2m6 3V10H6v10h12m0-12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3Z"/>
              </svg>
              <span className={styles.privatetext}>This group is private</span>
            </div>
          </div>
        </div>
      </div>
    )

  }
}

function CreatePost({state, dispatch}) {
  const [openDesc, setOpenDesc] = useState()
  const { nickname } = useAuth();
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState()
  const [categories, setCategories] = useState([])

  function handleTitleChange(e) {
    setTitle(e.target.value)
    return
  }

  return (
    <div className={styles.creator}>
      <input className={styles.title} placeholder={"What do you want to post, " + nickname} value={title} onChange={handleTitleChange} onClick={() => setOpenDesc(true)}/>
      {openDesc && <Description nickname={nickname} state={state} title={title} value={desc} dispatch={dispatch} setDesc={setDesc} categories={categories}/>}
    </div>
  )
}

function Description({nickname, state, title, value, setDesc, categories, dispatch}) {
  const [visibility, setVisibility] = useState("public")
  const [selectedFile, setSelectedFile] = useState()
  console.log(111, selectedFile)
  function submitPost() {
    let cookieStruct = {}
    for (const i of document.cookie.split("; ")) {
      let split = i.split("=")
      cookieStruct[split[0]] = split[1]
    }
    let formData = new FormData()
    let file = selectedFile
    formData.append("file", file)
    postImg('http://localhost:8000/api/v1/upload/', formData).then(x => {
      console.log(x)
      const postObj = {title: title, body: value, categoryId: parseInt(state.postCat)}
      postData('http://localhost:8000/api/v1/posts/', postObj)
        .then(i => dispatch({type: 'create', postId:i}))
        .catch(err => console.log("FOUND ERROR\n", err))
    })
  }
  if (title && value) {
    return (
      <>
        <div className={styles.postVisibility}>
          <div onClick={() => setVisibility("public")} className={visibility == "public" ? styles.activePostVisibility : styles.visBtn}>
            <svg className={styles.publicIcon} viewBox="0 0 24 24">
              <path d="m18 17-2-1h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2 8 8 0 0 1 3 12m-7 3a8 8 0 0 1-7-10l5 5v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"/>
            </svg>
            <span className={styles.publicText}>Public</span>
          </div>
          <div onClick={() => setVisibility("private")} className={visibility == "private" ? styles.activePostVisibility : styles.visBtn}>
            <svg className={styles.privateIcon} viewBox="0 0 24 24">
              <path d="m2 5 1-1 17 17-1 1-3-3-4 1c-5 0-9-4-11-8l3-5-2-2m10 4a3 3 0 0 1 3 3v1l-4-4h1m0-4c5 0 9 3 11 7l-4 5-1-1 3-4A10 10 0 0 0 9 7L7 5h5m-9 7a10 10 0 0 0 11 5l-2-2c-2 0-3-1-3-3L6 9l-3 3Z"/>
            </svg>
            <span className={styles.privateText}>Private</span>
          </div>
          <div onClick={() => setVisibility("almostprivate")} className={visibility == "almostprivate" ? styles.activePostVisibility : styles.visBtn}>
            <svg className={styles.almostPrivateIcon} viewBox="0 0 24 24">
              <path d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3-9a4 4 0 1 0-4 3 4 4 0 0 0 4-3m3 5a5 5 0 0 1 2 4v2h4v-2s0-4-6-4m-1-9a3 3 0 0 0-2 1 5 5 0 0 1 0 5 3 3 0 0 0 2 1 4 4 0 0 0 0-7Z"/>
            </svg>
            <span className={styles.almostPrivateText}>Almost private</span>
          </div>
        </div>
        <textarea className={styles.description} value={value} onChange={(e) => setDesc(e.target.value)} placeholder={"Please describe your thought..."}></textarea>
      <div className={styles.bottomBtns}>
        <div className={styles.addImg}>
          <label className={styles.addImageBtn} htmlFor="upload">
            <svg className={styles.addImageIcon} viewBox="0 0 24 24">
              <path d="m9 14 2 3 4-5 4 6H5m16 1V5l-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z"/>
            </svg>
            <span className={styles.addImageText}>
              Add an image
            </span>
          </label>
          <input type="file" id="upload" accept="image/jpg, image/png, image/gif" onChange={(e) => setSelectedFile(e.target.files[0])} hidden/>
        </div>
        <div className={styles.eventBtn} onClick={() => dispatch({type: "createEvent"})}>
          <svg className={styles.eventIcon} viewBox="0 0 24 24">
            <path fill="currentColor" d="m15 1-2 2 2 1v2l-3 3 1 2 3-4 1-2-1-2-1-2m-4 2L9 5h1v2H9l2 2V8l1-2-1-2V3m10 2-2 1-6 6 2 1 5-6a1 1 0 0 1 2 0l1 1 1-2h-1l-2-1M7 8 2 22l14-5-9-9m12 3-2 1-2 1 2 2 1-2a1 1 0 0 1 2 0l2 2 1-1-2-2-2-1Z"/>
          </svg>
          <span className={styles.eventBtnText}>Create event</span>
        </div>
      </div>
        <div className={styles.submitready} onClick={submitPost}>Post</div>
      </>
    ) 
  }

  return (
    <>
      <div className={styles.postVisibility}>
        <div onClick={() => setVisibility("public")} className={visibility == "public" ? styles.activePostVisibility : styles.visBtn}>
          <svg className={styles.publicIcon} viewBox="0 0 24 24">
            <path d="m18 17-2-1h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2 8 8 0 0 1 3 12m-7 3a8 8 0 0 1-7-10l5 5v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"/>
          </svg>
          <span className={styles.publicText}>Public</span>
        </div>
        <div onClick={() => setVisibility("private")} className={visibility == "private" ? styles.activePostVisibility : styles.visBtn}>
          <svg className={styles.privateIcon} viewBox="0 0 24 24">
            <path d="m2 5 1-1 17 17-1 1-3-3-4 1c-5 0-9-4-11-8l3-5-2-2m10 4a3 3 0 0 1 3 3v1l-4-4h1m0-4c5 0 9 3 11 7l-4 5-1-1 3-4A10 10 0 0 0 9 7L7 5h5m-9 7a10 10 0 0 0 11 5l-2-2c-2 0-3-1-3-3L6 9l-3 3Z"/>
          </svg>
          <span className={styles.privateText}>Private</span>
        </div>
        <div onClick={() => setVisibility("almostprivate")} className={visibility == "almostprivate" ? styles.activePostVisibility : styles.visBtn}>
          <svg className={styles.almostPrivateIcon} viewBox="0 0 24 24">
            <path d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3-9a4 4 0 1 0-4 3 4 4 0 0 0 4-3m3 5a5 5 0 0 1 2 4v2h4v-2s0-4-6-4m-1-9a3 3 0 0 0-2 1 5 5 0 0 1 0 5 3 3 0 0 0 2 1 4 4 0 0 0 0-7Z"/>
          </svg>
          <span className={styles.almostPrivateText}>Almost private</span>
        </div>
      </div>
      <textarea className={styles.description} value={value} onChange={(e) => setDesc(e.target.value)} placeholder={"Please describe your thought..."}></textarea>
      <div className={styles.bottomBtns}>
        <div className={styles.addImg}>
          <label className={styles.addImageBtn} htmlFor="upload">
            <svg className={styles.addImageIcon} viewBox="0 0 24 24">
              <path d="m9 14 2 3 4-5 4 6H5m16 1V5l-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z"/>
            </svg>
            <span className={styles.addImageText}>
              Add an image
            </span>
          </label>
          <input type="file" id="upload" accept="image/jpg, image/png, image/gif" onChange={(e) => setSelectedFile(e.target.files[0])} hidden/>
        </div>
        <div className={styles.eventBtn} onClick={() => dispatch({type: "createEvent"})}>
          <svg className={styles.eventIcon} viewBox="0 0 24 24">
            <path fill="currentColor" d="m15 1-2 2 2 1v2l-3 3 1 2 3-4 1-2-1-2-1-2m-4 2L9 5h1v2H9l2 2V8l1-2-1-2V3m10 2-2 1-6 6 2 1 5-6a1 1 0 0 1 2 0l1 1 1-2h-1l-2-1M7 8 2 22l14-5-9-9m12 3-2 1-2 1 2 2 1-2a1 1 0 0 1 2 0l2 2 1-1-2-2-2-1Z"/>
          </svg>
          <span className={styles.eventBtnText}>Create event</span>
        </div>
      </div>
      <div className={styles.submit}>Post</div>
    </>
  ) 
}


export async function postImg(url = '', data = {}, boolean = true) {
  // Default options are marked with *
  let cookieStruct = findCookies()
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Authentication': cookieStruct.session
    },
    redirect: 'follow', 
    referrerPolicy: 'no-referrer', 
    body: data 
  });
  if (boolean) {
    return response.json(); // parses JSON response into native JavaScript objects
  }
  return response
}
