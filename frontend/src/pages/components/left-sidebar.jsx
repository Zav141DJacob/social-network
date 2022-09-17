import React from 'react' 
import styles from './leftsidebar.module.css'
import {useAuth} from './../../App'
import { useNavigate } from 'react-router-dom'
import {useState, useEffect} from 'react'

export function LeftSideBar({dispatch, postPage}) {
  const {onLogout, nickname} = useAuth()
  const [groups, setGroups] = useState()
  const nav = useNavigate()

   let cookies = document.cookie
    
   let output = {};
    cookies.split(/\s*;\s*/).forEach(function(pair) {
        pair = pair.split(/\s*=\s*/);
        output[pair[0]] = pair.slice(1).join('=');
    });

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/categories/',
    {method: "GET", mode:'cors', cache:'no-cache', credentials: 'include',  headers: {Authentication: output.session}})
    .then(item => {
      item.json().then(item => setGroups(item))
    })
  }, [])

  const categoryHandler = (e) => {
    if (postPage) {
      nav('/')
    }
    dispatch({type: "category", category: e.target.id}) 
  }
  return (
    <div className={styles.sidebar}>
      <div className={styles.topics}>
        <h2 className={styles.topicsHeader}>Groups</h2>
        <ul className={styles.topicslist}>
            {groups && groups.map(group => {
              return <li key={group.Title} className={styles.topic} id={(group.Title).toLowerCase()} onClick={categoryHandler}>{group.Title}</li>
            })}
          <li className={styles.seemore} id="seemore">See more</li>
        </ul>
      </div>
      <div onClick={() => dispatch({type: "group"})} className={styles.logout}>
        <button type="button" onClick={() => dispatch({type: "group"})} className={styles.logoutBtn}>Create a group</button>
      </div>
    </div>
  )
}
