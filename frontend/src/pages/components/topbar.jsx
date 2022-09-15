import styles from './topbar.module.css'
import {useAuth} from './../../App'
import { useState } from 'react'

export function TopBar() {
  let {nickname} = useAuth();
  let [avatar, setAvatar] = useState()
  fetch("http://localhost:8000/api/v1/users/nickname/" + nickname + "/")
    .then((item) => item.json().then(res =>  setAvatar(res[0].Avatar)))
  return (
    <div className={styles.topbar}>
      <div className={styles.logo}>Meetup</div>
      <div className={styles.actions}>
      <div className={styles.notifications}>
      <svg className={styles.bell} viewBox="0 0 24 24">
        <path fill="white" style={{"transform": "scale(0.7)"}} d="M10 21h4l-2 2-2-2m11-2v1H3v-1l2-2v-6c0-3 2-6 5-7l2-2 2 2c3 1 5 4 5 7v6l2 2m-4-8c0-3-2-5-5-5s-5 2-5 5v7h10v-7Z"/>
      </svg>
      </div>
      <img className={styles.profile} src={`http://localhost:8000/static/${avatar}`} />
      </div>
    </div>
  )
}
