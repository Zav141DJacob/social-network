import styles from './group.module.css'
import { useState } from 'react'
import {useAuth} from './../../App'

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow', 
    referrerPolicy: 'no-referrer', 
    body: JSON.stringify(data) 
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

export function Group({dispatch}) {
  const { nickname } = useAuth();
  const [title, setTitle] = useState()
  const [desc, setDesc] = useState()

  function handleTitleChange(e) {
    setTitle(e.target.value)
    return
  }
  return (
    <div className={styles.creator}>
    <h1 style={{"color": "white"}}>Create a group</h1>
    <input className={styles.title} placeholder={"What do you want to post, " + nickname} value={title} onChange={handleTitleChange} />
    <Description nickname={nickname} title={title} value={desc} dispatch={dispatch} setDesc={setDesc} />
    <div>
    <h2 style={{"color": "white"}}>Invite users</h2>
    </div>
    </div>
  )
}

function Description({nickname, title, value, setDesc, dispatch}) {
  function submitPost() {
    let cookieStruct = {}
    for (const i of document.cookie.split("; ")) {
        let split = i.split("=")
        cookieStruct[split[0]] = split[1]
      }
    const postObj = {title: title, body: value, userToken: cookieStruct.session}
    // postData('http://localhost:8000/api/v1/posts/', postObj).then(i => dispatch({type: 'create', postId:i}))
  }
  if (title && value) {
    return (
      <>
      <textarea className={styles.description} value={value} onChange={(e) => setDesc(e.target.value)} placeholder={"Please describe your thought..."}></textarea>
      <div className={styles.submitready} onClick={submitPost}>Create</div>
      </>
     ) 
  }

  return (
  <>
      <textarea className={styles.description} value={value} onChange={(e) => setDesc(e.target.value)} placeholder={"Please describe your thought..."}></textarea>
      <div className={styles.submit}>Create</div>
  </>
  ) 
}
