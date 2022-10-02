import styles from './event.module.css'
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

export function Event({dispatch}) {
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
        <h1 style={{"position": "relative", "top": "14px" ,"color": "white", }}>Create an event</h1>
        <input className={styles.title} placeholder={"What is the group name, " + nickname + "?"} value={title} onChange={handleTitleChange} />
        <input type="date" />
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
