import {useAuth, ws, wsOnMessage} from './../../App'
import {useState, useEffect} from 'react'
import styles from './profile.module.css'
import { PostComponent } from './post'
import {fetchGroups} from '../../utils/queries'
import {useQuery} from '@tanstack/react-query'

export function Profile({userId, state, dispatch}) {
  const {nickname} = useAuth();
  const [access, setAccess] = useState(false)
  const [profile, setProfile] = useState()
  const [module, setModule] = useState()
  const [profilePrivate, setProfilePrivate] = useState()
  const [followStatus, setFollowStatus] = useState()
  let cookies = document.cookie
  useEffect(() => {
    if (profile?.User) {
      setProfilePrivate(profile?.User?.IsPrivate)
    }
    if (profile?.Followers) {
      setFollowStatus(profile.Followers.some(i => i.FollowerNickname === nickname))
    }
  }, [profile])

  let output = {};
  cookies.split(/\s*;\s*/).forEach(function(pair) {
    pair = pair.split(/\s*=\s*/);
    output[pair[0]] = pair.slice(1).join('=');
  });

  const {data: groups} = useQuery(["groups"], fetchGroups, {
    refetchOnMount: false
  })

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
          .then((item) => {setAccess(state.profileId == nickname || item.status != 401);item.json().then(res =>  setProfile(res))})
        window.history.pushState("y2", "x3", `/users/${state.profileId}`)
      } else if (userId) {
        fetch(`http://localhost:8000/api/v1/profile/?nickname=${userId}`,
          {mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authentication': output.session,
            }})
          .then((item) => {setAccess(state.profileId == nickname || item.status != 401);item.json().then(res =>  setProfile(res))})
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
          .then((item) => {setAccess(true);item.json().then(res =>  setProfile(res))})
        window.history.pushState("y2", "x3", `/users/${nickname}`)
      }
    }
    setModule()
  }, [state.profileId])

  function follow(user) {
    if (!profile.User.IsPrivate) {
      setFollowStatus(true)
      const postObj = {targetId: user}
      ws.send(JSON.stringify({...postObj, mode: "follow"}))
      return
    }
    const postObj = {targetId: user}
    // console.log(postObj)
    ws.send(JSON.stringify({...postObj, mode: "follow"}))
  }

  function unfollow(user) {
    const postObj = {userId: user}
    // console.log(postObj)
    fetch("http://localhost:8000/api/v1/followers/",
      {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authentication': output.session,
        },
        body: JSON.stringify(postObj)
      }).then(i => {
        if (profile?.User?.IsPrivate) {
          setAccess(false)
        } else {
          setFollowStatus(false)
        }
      }) 
  }
  
  function changePrivacy() {
    setProfilePrivate(!profilePrivate)
    const postObj = {userId: profile.User.UserId} // mida me ENDPOINTI saadame?
    // console.log(postObj)
    fetch("http://localhost:8000/api/v1/profile/",
      {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authentication': output.session,
        },
        body: JSON.stringify(postObj)
      })
  }

  if (profile?.User && !access) {
    return (
      <div className={styles.feed}>
        <div className={styles.profile}>
          <img className={styles.avatar} alt="avatar" src={`http://localhost:8000/static/${profile.User.Avatar}`} />
          <h2 className={styles.name}>{profile.User.FirstName} {profile.User.LastName}
            {profile.User.Nickname !== nickname && <button className={styles.followBtn} onClick={() => follow(profile.User.UserId)}>Follow</button>}
            {profile.User.Nickname === nickname && <span onClick={() => {setModule("privacy")}}>
              <svg viewBox="0 0 24 24"className={styles.settingsBtn}>
                <path fill="white" d="M12 8a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2m-2 12-1-3-2-1-2 1H4l-2-4 3-2v-2L2 9l2-4h1l2 1 2-1 1-3h5v3l2 1 2-1h1l2 4-3 2 1 1-1 1 3 2-2 4h-1l-2-1-2 1v3h-5m1-18v3L8 8 5 7v2l2 1v4l-2 1v2l3-1 3 1v3h2v-3l3-1 3 1v-2l-2-1v-4l2-1V7l-3 1-3-1V4h-2Z"/>
              </svg>
            </span>}
          </h2>
          <div className={styles.stats}>
            <span>{(profile?.Posts?.length || profile?.Posts ) ?? 0} posts</span>
            <span className={styles.followers}>{profile?.Followers?.length ?? 0} followers</span>
            <span className={styles.following}>{profile?.Following?.length ?? 0} following</span>
          </div>
          {profile.User.Nickname && <span className={styles.nickname}>{profile.User.Nickname}</span>}
          <span className={styles.age}>{profile.User.Age}</span>
          <span className={styles.bio}>{profile.User.Bio}</span>
          <span className={styles.email}>{profile.User.Email}</span>
        </div>
        {profile.User.IsPrivate &&
        <div className={styles.private}>
          <div className={styles.privatebox}>
            <svg className={styles.lock} viewBox="0 0 24 24">
              <path strokeWidth="0.6"  d="M12 17a2 2 0 1 1 0-4 2 2 0 0 1 2 2 2 2 0 0 1-2 2m6 3V10H6v10h12m0-12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3Z"/>
            </svg>
            <span className={styles.privatetext}>This profile is private</span>
          </div>
        </div>}
        {module === "privacy" && <div className={styles.followModule}>
          <div className={styles.arrowUp}></div>
          <div className={styles.closeModal} onClick={() => setModule()}>
            <svg  viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </div>
          <span className={styles.moduleLabel}>Set profile privacy</span>
          <span className={styles.switchText}>Private profile</span>
          <div className={styles.switch}>
            <input id="switch-1" type="checkbox" checked={profile.User.IsPrivate} className={styles.switchInput} />
            <label htmlFor="switch-1" className={styles.switchLabel}>Switch</label>
          </div>
        </div>}
      </div>
    )
  } else if (profile?.User && access) {
    return (
      <div className={styles.feed}>
        <div className={styles.profile}>
          <img className={styles.avatar} alt="avatar" src={`http://localhost:8000/static/${profile.User.Avatar}`} />
          <h2 className={styles.name}>{profile.User.FirstName} {profile.User.LastName}
            {profile.User.Nickname !== nickname && !followStatus && <button className={styles.followBtn} onClick={() => follow(profile.User.UserId)}>Follow</button>}
            {profile.User.Nickname !== nickname && followStatus && <button className={styles.unfollowBtn} onClick={() => unfollow(profile.User.UserId)}>Unfollow</button>}
            {profile.User.Nickname === nickname && <span onClick={() => {module === "privacy" ? setModule() : setModule("privacy")}}>
              <svg viewBox="0 0 24 24"className={styles.settingsBtn}>
                <path fill="white" d="M12 8a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2m-2 12-1-3-2-1-2 1H4l-2-4 3-2v-2L2 9l2-4h1l2 1 2-1 1-3h5v3l2 1 2-1h1l2 4-3 2 1 1-1 1 3 2-2 4h-1l-2-1-2 1v3h-5m1-18v3L8 8 5 7v2l2 1v4l-2 1v2l3-1 3 1v3h2v-3l3-1 3 1v-2l-2-1v-4l2-1V7l-3 1-3-1V4h-2Z"/>
              </svg>
            </span>}
          </h2>
          <div className={styles.stats}>
            <span>{(profile?.Posts?.length || profile?.Posts ) ?? 0} posts</span>
            <span className={styles.followers} onClick={() => setModule("followers")}>{profile?.Followers?.length ?? 0} followers</span>
            <span className={styles.following} onClick={() => setModule("following")}>{profile?.Following?.length ?? 0} following</span>
          </div>
          {profile.User.Nickname && <span className={styles.nickname}>{profile.User.Nickname}</span>}
          <span className={styles.age}>{profile.User.Age}</span>
          <span className={styles.bio}>{profile.User.Bio}</span>
          <span className={styles.email}>{profile.User.Email}</span>
        </div>
        <div className={styles.posts} >
          {profile.Posts?.map(i => {
            let cat = groups?.filter(x => x.CatId === i.CatId)
            if (cat) {
              return (
                <PostComponent key={i.PostId} postInfo={{"Post": i}} dispatch={dispatch} group={cat[0].Title}/>
              )
            }
          })}
        </div>
        {module === "following" && <div className={styles.followModule}>
          <div className={styles.arrowUp}></div>
          <div className={styles.closeModal} onClick={() => setModule()}>
            <svg  viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </div>
          <span className={styles.moduleLabel}>Users who {profile.User.Nickname} is following</span>
          {profile.Following && profile?.Following.map(follower => {
            return (
              <div key={follower.UserId} className={styles.follower}>
                <div className={styles.followerAvatar}><img className={styles.followerAvatarImg} src={`http://localhost:8000/static/${follower.Avatar}`}/></div>
                <div className={styles.followerNickname} onClick={() => dispatch({type: "profile", Id: `${follower.Nickname}`})}>{follower.Nickname}</div>
              </div>
            )
          })}
        </div>}
        {module === "privacy" && <><div className={styles.arrowUp}></div>
          <div className={styles.privacyModule}>
            <div className={styles.closeModal} onClick={() => setModule()}>
              <svg  viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </div>
            <span className={styles.moduleLabel}>Set profile privacy</span>
            <span className={styles.switchText}>Private profile</span>
            <div className={styles.switch}>
              <input id="switch-1" checked={profilePrivate} onChange={changePrivacy} type="checkbox" className={styles.switchInput} />
              <label htmlFor="switch-1" className={styles.switchLabel}>Switch</label>
            </div>
          </div></>}
        {module === "followers" && <div className={styles.followModule}>
          <div className={styles.closeModal} onClick={() => setModule()}>
            <svg  viewBox="0 0 24 24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </div>
          <span className={styles.moduleLabel}>Users who follow {profile.User.Nickname}</span>
          {profile.Followers && profile?.Followers.map(follower => {
            return (
              <div key={follower.UserId} className={styles.follower}>
                <div className={styles.followerAvatar}><img className={styles.followerAvatarImg} src={`http://localhost:8000/static/${follower.FollowerAvatar}`}/></div>
                <div className={styles.followerNickname} onClick={() => dispatch({type: "profile", Id: `${follower.FollowerNickname}`})}>{follower.FollowerNickname}</div>
              </div>
            )
          })}
        </div>}
      </div>
    )
  }
}
