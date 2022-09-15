import React from 'react' 
import styles from './leftsidebar.module.css'
import {useAuth} from './../../App'
import { useNavigate } from 'react-router-dom'

export function LeftSideBar({dispatch, postPage}) {
  const {onLogout, nickname} = useAuth()
  const nav = useNavigate()

  const categoryHandler = (e) => {
    if (postPage) {
      nav('/')
    }
    dispatch({type: "category", category: e.target.id}) 
  }
  return (
    <div className={styles.sidebar}>
      <div className={styles.greeting}>
        <h1>Hello, {nickname}</h1>
      </div>
      <div className={styles.topics}>
        <h2 className={styles.topicsHeader}>Topics</h2>
        <ul className={styles.topicslist}>
          <li className={styles.topic} id="rust" onClick={categoryHandler}><div style={{width: "25px"}}><div className={styles.rustlogo}/></div>Rust</li>
          <li className={styles.topic} id="js" onClick={categoryHandler}><div style={{width: "20px"}}><div className={styles.jslogo}/></div>Javascript</li>
          <li className={styles.topic} id="go" onClick={categoryHandler}><div style={{height: "20px", width: "40px"}}><div className={styles.gologo}/></div>Golang</li>
          <li className={styles.topic} id="create" onClick={() => dispatch({type: "group"})}><button>Create a group</button></li>
        </ul>
      </div>
      <div onClick={onLogout} className={styles.logout}>
        <button type="button" onClick={onLogout} className={styles.logoutBtn}>Log out</button>
      </div>
    </div>
  )
}
