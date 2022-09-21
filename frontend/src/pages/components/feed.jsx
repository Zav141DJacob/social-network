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

export function Feed({selectedCat, dispatch, forwardRef, scrollValue}) {
  const [posts, setPosts] = useState()
  const throttler = useRef(throttle((newVal, ref) => ref?.current?.scroll({top: newVal}), 40))
  const [postCopy, setPostCopy] = useState()
  useEffect(() => {
    if (!posts) {
      fetch(`http://localhost:8000/api/v1/posts/`).then(res => res.json().then(i => setPosts(i)))
    }
    if (forwardRef.current) {
      throttler.current(scrollValue, forwardRef)
    }
  })

  useEffect(() => {
    if (selectedCat.postCat) {
      switch (selectedCat.postCat) {
        case 'rust':
          setPostCopy(posts?.filter(post => post.Category.HasRust === true))
          return;
        case 'js':
          setPostCopy(posts?.filter(post => post.Category.HasJavascript === true))
          return;
        case 'golang':
          setPostCopy(posts?.filter(post => post.Category.HasGolang === true))
          return;
      }
    }
    setPostCopy(posts?.slice())
  }, [posts, selectedCat])
  return (
    <div className={styles.feed} ref={forwardRef}>
      <CreatePost dispatch={dispatch}/>
      <div className={styles.posts} >
        {postCopy?.map(i => <PostComponent key={i?.Post?.PostId} postInfo={i} dispatch={dispatch}/>)}
      </div>
    </div>
  )
}

function CreatePost({dispatch}) {
  const [openDesc, setOpenDesc] = useState()
  const { nickname } = useAuth();
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState()
  const [categories, setCategories] = useState([])

  function selectCategory(e) {
    if (e.target.parentNode.tagName === "LI") {
      e.target.parentNode.classList.toggle(`${styles.bang}`)
      if (categories.includes(e.target.parentNode.id)) {
        setCategories(categories.filter((i) => i !== e.target.parentNode.id))
      } else {
        let catCopy = [...categories]
        catCopy.push(e.target.parentNode.id)
        setCategories(catCopy)
      }
      return
    } else if (e.target.parentNode.parentNode.tagName === "LI") {
      e.target.parentNode.parentNode.classList.toggle(`${styles.bang}`)
      if (categories.includes(e.target.parentNode.parentNode.id)) {
        setCategories(categories.filter((i) => i !== e.target.parentNode.parentNode.id))
      } else {
        let catCopy = [...categories]
        catCopy.push(e.target.parentNode.parentNode.id)
        setCategories(catCopy)
      }
      return
    } else if (e.target.parentNode.parentNode.parentNode.tagName === "LI") {
      e.target.parentNode.parentNode.parentNode.classList.toggle(`${styles.bang}`)
      if (categories.includes(e.target.parentNode.parentNode.parentNode.id)) {
        setCategories(categories.filter((i) => i !== e.target.parentNode.parentNode.parentNode.id))
      } else {
        let catCopy = [...categories]
        catCopy.push(e.target.parentNode.parentNode.parentNode.id)
        setCategories(catCopy)
      }
      return
    }
    e.target.classList.toggle(`${styles.bang}`)
    if (categories.includes(e.target.id)) {
      setCategories(categories.filter((i) => i !== e.target.id))
    } else {
      let catCopy = [...categories]
      catCopy.push(e.target.id)
      setCategories(catCopy)
    }
  }
  function handleTitleChange(e) {
    setTitle(e.target.value)
    return
  }

  return (
    <div className={styles.creator}>
      <input className={styles.title} placeholder={"What do you want to post, " + nickname} value={title} onChange={handleTitleChange} onClick={() => setOpenDesc(true)}/>
      {openDesc && <Description nickname={nickname} title={title} value={desc} dispatch={dispatch} setDesc={setDesc} categories={categories}/>}
      <div className={styles.categories}>
        <ul className={styles.ul}>
          <li className={styles.li} id="rust" onClick={selectCategory}><div className={styles.category} style={{top: "-14px"}}><div style={{width: "22px"}}><div className={styles.rustlogo}/></div>Rust</div></li>
          <li className={styles.li} id="js" onClick={selectCategory}><div className={styles.category}><div style={{width: "20px"}}><div className={styles.jslogo}/></div>Javascript</div></li>
          <li className={styles.li} id="go" onClick={selectCategory}><div className={styles.category}><div style={{height: "20px", width: "40px"}}><div className={styles.gologo}/></div>Golang</div></li>
        </ul>
      </div>
    </div>
  )
}

function Description({nickname, title, value, setDesc, categories, dispatch}) {
  function submitPost() {
    let cats = categories.map(i => {
      switch(i) {
        case 'rust':
          return 3;
        case 'js':
          return 2;
        case 'go':
          return 1;
        default:
          return null
      }
    })
    cats.sort()
    let cookieStruct = {}
    for (const i of document.cookie.split("; ")) {
      let split = i.split("=")
      cookieStruct[split[0]] = split[1]
    }
    const postObj = {title: title, body: value, categories: cats, userToken: cookieStruct.session}
    postData('http://localhost:8000/api/v1/posts/', postObj).then(i => dispatch({type: 'create', postId:i}))
  }
  if (title && value && categories?.length > 0) {
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
