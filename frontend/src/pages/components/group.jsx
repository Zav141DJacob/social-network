import styles from './group.module.css'
import { ws } from './right-sidebar'
import { useState } from 'react'
import {useAuth} from './../../App'
import { findCookies } from './right-sidebar';
import { postData } from '../Login';

// async function postData(url = '', data = {}) {
//   console.log(url, data);
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
  // return response.json(); // parses JSON response into native JavaScript objects
// }

export function Group({dispatch}) {
  const { nickname } = useAuth();
  const [title, setTitle] = useState("")
  const [visibility, setVisibility] = useState("public")
  const [desc, setDesc] = useState()

  function handleTitleChange(e) {
    setTitle(e.target.value)
    return
  }
  return (
    <div className={styles.feed}>
      <div className={styles.creator}>
        <h1 style={{"position": "relative", "top": "14px" ,"color": "white", }}>Create a group</h1>
        <input className={styles.title} placeholder={"What is the group name, " + nickname + "?"} value={title} onChange={handleTitleChange} />
        <div className={styles.postVisibility}>
          <div onClick={() => setVisibility("public")} className={visibility == "public" ? styles.activePostVisibility : styles.visBtn}>
            <svg className={styles.publicIcon} viewBox="0 0 24 24">
              <path d="m18 17-2-1h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2 8 8 0 0 1 3 12m-7 3a8 8 0 0 1-7-10l5 5v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"/>
            </svg>
            <span>Public</span>
          </div>
          <div onClick={() => setVisibility("private")} className={visibility == "private" ? styles.activePostVisibility : styles.visBtn}>
            <svg className={styles.privateIcon} viewBox="0 0 24 24">
              <path d="m2 5 1-1 17 17-1 1-3-3-4 1c-5 0-9-4-11-8l3-5-2-2m10 4a3 3 0 0 1 3 3v1l-4-4h1m0-4c5 0 9 3 11 7l-4 5-1-1 3-4A10 10 0 0 0 9 7L7 5h5m-9 7a10 10 0 0 0 11 5l-2-2c-2 0-3-1-3-3L6 9l-3 3Z"/>
            </svg>
            <span>Private</span>
          </div>
        </div>
        <Description nickname={nickname} title={title} value={desc} visibility={visibility} dispatch={dispatch} setDesc={setDesc} />
      </div>
    </div>
  )
}

function Description({nickname, title, value, visibility, setDesc, dispatch}) {
  function submitPost() {
    let isPublic = visibility === "public"
    const postObj = {title: title, description: value, isPublic: isPublic}
    ws.send(JSON.stringify({...postObj, mode: "registerGroup"}))
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
