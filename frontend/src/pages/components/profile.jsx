import {useAuth} from './../../App'
import { ws } from './right-sidebar'
import {useState, useEffect} from 'react'
import styles from './profile.module.css'

export function Profile({userId, state, dispatch}) {
  const {nickname} = useAuth();
  const [profile, setProfile] = useState()
  let cookies = document.cookie

  let output = {};
  cookies.split(/\s*;\s*/).forEach(function(pair) {
    pair = pair.split(/\s*=\s*/);
    output[pair[0]] = pair.slice(1).join('=');
  });

  useEffect(() => {
    if (state?.profile) {
      if (state.profileId) {
        fetch(`http://localhost:8000/api/v1/profile/?nickname=${state.profileId}`,
          {mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authentication': output.session,
            },})
          .then((item) => item.json().then(res =>  setProfile(res)))
        window.history.pushState("y2", "x3", `/users/${state.profileId}`)
      } else if (userId) {
        fetch(`http://localhost:8000/api/v1/profile/?nickname=${userId}`,
          {mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authentication': output.session,
            },})
          .then((item) => item.json().then(res =>  setProfile(res)))
        window.history.pushState("y2", "x3", `/users/${userId}`)
      } else {
        fetch(`http://localhost:8000/api/v1/profile/?nickname=${nickname}`,
          {mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authentication': output.session,
            },})
          .then((item) => item.json().then(res =>  setProfile(res)))
        window.history.pushState("y2", "x3", `/users/${nickname}`)
      }
    }
  }, [state?.profile, state?.profileId])

  let isPrivate = true

  function follow(user) {
    const postObj = {targetId: user}
    console.log(postObj)
    ws.send(JSON.stringify({...postObj, mode: "follow"}))
  }

  if (profile?.User) {
    return (
      <div className={styles.feed}>
        <div className={styles.profile}>
          <img className={styles.avatar} src={`http://localhost:8000/static/${profile.User.Avatar}`} />
          {profile.User.Nickname !== nickname && <button className={styles.followBtn} onClick={() => follow(profile.User.UserId)}>Follow</button>}
          <h2 className={styles.name}>{profile.User.FirstName} {profile.User.LastName}</h2>
          <div className={styles.stats}>
            <span>{(profile?.Posts?.length || profile?.Posts ) ?? 0} posts</span>
            <span>{profile?.Followers?.length ?? 0} followers</span>
            <span>{profile?.Following?.length ?? 0} following</span>
          </div>
          {profile.User.Nickname && <span className={styles.nickname}>{profile.User.Nickname}</span>}
          <span className={styles.age}>{profile.User.Age}</span>
          <span className={styles.bio}>{profile.User.Bio}</span>
          <span className={styles.email}>{profile.User.Email}</span>
        </div>
        {isPrivate &&
        <div className={styles.private}>
          <div className={styles.privatebox}>
            <svg className={styles.lock} viewBox="0 0 24 24">
              <path strokeWidth="0.6"  d="M12 17a2 2 0 1 1 0-4 2 2 0 0 1 2 2 2 2 0 0 1-2 2m6 3V10H6v10h12m0-12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3Z"/>
            </svg>
            <span className={styles.privatetext}>This profile is private</span>
          </div>
        </div>}
      </div>
    )
  }
}
