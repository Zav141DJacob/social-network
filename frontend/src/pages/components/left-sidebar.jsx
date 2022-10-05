import React from 'react' 
import styles from './leftsidebar.module.css'
import {useAuth, ws, wsOnMessage} from './../../App'
import { useNavigate } from 'react-router-dom'
import {useState, useEffect} from 'react'
import {fetchGroups} from './feed'
import {useQuery} from '@tanstack/react-query'

export function LeftSideBar({dispatch, state}) {
  const {data: groups} = useQuery(["groups"], fetchGroups, {
    refetchOnMount: false
  })

  const categoryHandler = (e) => {
    let select = groups.filter(i => i.CatId == e.target.id);
    dispatch({type: "category", catName: e.target.textContent, category: e.target.id, public: select[0].IsPublic}) 
    window.history.pushState("y2", "x3", `/group/${e.target.id}`)
  }
  return (
    <div className={styles.sidebar}>
      <div className={styles.topics}>
        <h2 className={styles.topicsHeader}>Groups</h2>
        <ul className={styles.topicslist}>
          {groups && groups.map(group => {
            return <li key={group.Title} className={styles.topic} id={group.CatId} onClick={categoryHandler}>{group.Title}</li>
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
