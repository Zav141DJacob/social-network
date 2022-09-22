import { useState, useEffect, useRef } from 'react'
import styles from './feed.module.css'
import {useAuth} from './../../App'
import { PostComponent } from './post'
import {throttle} from 'lodash'
import { postData } from '../Login'

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
      fetch(`http://localhost:8000/api/v1/posts/`, {method: "GET", mode:'cors', cache:"no-cache", credentials:"include", headers: {Authentication: output.session}}).then(res => res.json().then(i => setPosts(i)))
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
  return (
    <div className={styles.feed} ref={forwardRef}>
      <CreatePost dispatch={dispatch} state={state}/>
      <div className={styles.posts} >
        {postCopy?.map(i => <PostComponent key={i?.Post?.PostId} postInfo={i} dispatch={dispatch}/>)}
      </div>
    </div>
  )
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
      <div className={styles.categories}>
      </div>
    </div>
  )
}

function Description({nickname, state, title, value, setDesc, categories, dispatch}) {
  function submitPost() {
    let cookieStruct = {}
    for (const i of document.cookie.split("; ")) {
      let split = i.split("=")
      cookieStruct[split[0]] = split[1]
    }
    const postObj = {title: title, body: value, categoryId: state.postCat}
    postData('http://localhost:8000/api/v1/posts/', postObj).then(i => dispatch({type: 'create', postId:i}))
  }
  if (title && value) {
    return (
      <>
        <textarea className={styles.description} value={value} onChange={(e) => setDesc(e.target.value)} placeholder={"Please describe your thought..."}></textarea>
        <div className={styles.submitready} onClick={submitPost}>Post</div>
      </>
    ) 
  }

  return (
    <>
      <textarea className={styles.description} value={value} onChange={(e) => setDesc(e.target.value)} placeholder={"Please describe your thought..."}></textarea>
      <div className={styles.submit}>Post</div>
    </>
  ) 
}
