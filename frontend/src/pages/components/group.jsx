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
        <h1 style={{"color": "white"}}>Create a group</h1>
        <input className={styles.title} placeholder={"What is the group name, " + nickname + "?"} value={title} onChange={handleTitleChange} />
        <div className={styles.dropdownVisibility}>
        <label htmlFor="visibility">Visibility</label>
        <select name="visibility" id="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
          </div>
        <Description nickname={nickname} title={title} value={desc} dispatch={dispatch} setDesc={setDesc} />
      </div>
    </div>
  )
}

function Description({nickname, title, value, visibility, setDesc, dispatch}) {
  function submitPost() {
    let cookieStruct = findCookies();
    let isPrivate = visibility === "private"
    const postObj = {title: title, description: value, isPrivate: isPrivate}
    // postData('http://localhost:8000/api/v1/categories/', postObj).then(i => dispatch({type: 'create', postId:i}))
    // postData('http://localhost:8000/api/v1/categories/', postObj, false).then(i => console.log(i));
      let x = ws.send(JSON.stringify({...postObj, mode: "registerGroup"}))
    console.log(x)
    return
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
