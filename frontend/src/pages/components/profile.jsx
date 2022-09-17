import {useAuth} from './../../App'
import {useState, useEffect} from 'react'
import styles from './profile.module.css'
export function Profile({userId, state, dispatch}) {
  const {nickname} = useAuth();
  const [profile, setProfile] = useState()
  let cookies = document.cookie
  console.log(123, userId)

  let output = {};
  cookies.split(/\s*;\s*/).forEach(function(pair) {
    pair = pair.split(/\s*=\s*/);
    output[pair[0]] = pair.slice(1).join('=');
  });

  useEffect(() => {
    if (state?.profile) {
      if (state.profileId) {
        fetch("http://localhost:8000/api/v1/users/nickname/" + state.profileId + "/")
          .then((item) => item.json().then(res =>  setProfile(res[0])))
        window.history.pushState("y2", "x3", `/users/${state.profileId}`)
      } else if (userId) {
        fetch("http://localhost:8000/api/v1/users/nickname/" + userId + "/")
          .then((item) => item.json().then(res =>  setProfile(res[0])))
        window.history.pushState("y2", "x3", `/users/${userId}`)
      } else {
        fetch("http://localhost:8000/api/v1/users/nickname/" + nickname + "/")
          .then((item) => item.json().then(res =>  setProfile(res[0])))
        window.history.pushState("y2", "x3", `/users/${nickname}`)
      }
    }
  }, [state?.profile, state?.profileId])

  if (profile) {
  return (
    <div className={styles.feed}>
    <div className={styles.profile}>
    <img className={styles.avatar} src={`http://localhost:8000/static/${profile.Avatar}`} />
    <h2 className={styles.name}>{profile.FirstName} {profile.LastName}</h2>
    <div className={styles.stats}>
    <span>0 posts</span>
    <span>0 followers</span>
    <span>0 following</span>
    </div>
    {profile.Nickname && <span className={styles.nickname}>{profile.Nickname}</span>}
    <span className={styles.age}>{profile.Age}</span>
    <span className={styles.bio}>{profile.Bio}</span>
    <span className={styles.email}>{profile.Email}</span>
    </div>
    </div>
  )
  }
}
