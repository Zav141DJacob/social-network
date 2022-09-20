import styles from './topbar.module.css'
import {useAuth} from './../../App'
import { useState } from 'react'

function ProfileDropdown({dispatch}) {
  const {onLogout, nickname} = useAuth();
  return (
    <>
      <div className={styles.arrowUp}></div>
      <div className={styles.profileDrop}>
        <span className={styles.dropFirst}onClick={() => dispatch({type: "profile", Id: undefined})}>{nickname}</span>
        <hr/>
        <span className={styles.dropSecond} onClick={() => dispatch({type: "profile", Id: undefined})}>
          <h3 className={styles.settingstext} onClick={() => dispatch({type: "profile", Id: undefined})}>Profile & Settings</h3>
          <svg viewBox="0 0 24 24" className={styles.settings}>
            <path d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4 0 8 2 8 4v2H4v-2c0-2 4-4 8-4Z"/>
          </svg>
        </span>
        <hr/>
        <span className={styles.dropThird} onClick={onLogout}>
          <h3 className={styles.logouttext}>Log out</h3>
          <svg viewBox="0 0 24 24" className={styles.logout}>
            <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9Z"/>
          </svg>
        </span>
      </div>
    </>
  )
}

export function TopBar({dispatch, state}) {
  let {nickname} = useAuth()
  let [avatar, setAvatar] = useState()
  fetch("http://localhost:8000/api/v1/users/nickname/" + nickname + "/")
    .then((item) => item.json().then(res =>  setAvatar(res[0].Avatar)))
  return (
    <div className={styles.topbar}>
      <div className={styles.logo} onClick={() => {dispatch({type: "home"})}}>Meetup</div>
      <div className={styles.actions}>
        <div className={styles.notifications}>
          <svg className={styles.bell} viewBox="0 0 24 24">
            <path fill="whitesmoke" d="M10 21h4l-2 2-2-2m11-2v1H3v-1l2-2v-6c0-3 2-6 5-7l2-2 2 2c3 1 5 4 5 7v6l2 2m-4-8c0-3-2-5-5-5s-5 2-5 5v7h10v-7Z"/>
          </svg>
        </div>
        <img className={styles.profile} onClick={() => dispatch({type: "profileDrop"})}src={`http://localhost:8000/static/${avatar}`} />
      </div>
      {state.profileDrop && <ProfileDropdown dispatch={dispatch} />}
    </div>
  )
}
