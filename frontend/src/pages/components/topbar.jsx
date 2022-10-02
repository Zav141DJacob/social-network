import styles from './topbar.module.css'
import {useAuth} from './../../App'
import { useState } from 'react'
import { findCookies, ws } from './right-sidebar'
import { useEffect } from 'react'
import { postData } from '../Login'

export { ws2 }
let ws2 = {}


export async function putData(url = '', data = {}, wantObject = true) {
  // Default options are marked with *
  let cookieStruct = findCookies()
  const response = await fetch(url, {
    method: 'PUT',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authentication': cookieStruct.session,
    },
    redirect: 'follow', 
    referrerPolicy: 'no-referrer', 
    body: JSON.stringify(data) 
  });
  if (wantObject) {
    return response.json(); // parses JSON response into native JavaScript objects
  }
  return response
}

export async function getData(url = '', wantObject = true) {
  // Default options are marked with *
  let cookieStruct = findCookies()
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authentication': cookieStruct.session,
    },
    redirect: 'follow', 
    referrerPolicy: 'no-referrer', 
    // body: JSON.stringify(data) 
  });
  if (wantObject) {
    return response.json(); // parses JSON response into native JavaScript objects
  }
  return response
}

export async function deleteData(url = '', data = {}, wantObject = true) {
  // Default options are marked with *
  let cookieStruct = findCookies()
  const response = await fetch(url, {
    method: 'DELETE',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authentication': cookieStruct.session,
    },
    redirect: 'follow', 
    referrerPolicy: 'no-referrer', 
    body: JSON.stringify(data) 
  });
  if (wantObject) {
    return response.json(); // parses JSON response into native JavaScript objects
  }
}

export function ws2Setup() {
  if (ws2.readyState != 0) {
    ws2 = new WebSocket("ws://localhost:8000/empty-ws/")
  } 

  // let cookieStruct = findCookies()

  // let nickname = cookieStruct.uID

  ws2.onopen = function() {
    console.log("\"ws2\" lock & loaded")
  }
}
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

export let mockNotifications = []

function handleFollow(doFollow, id, notifications, setNotifications, userId) {
  // event.preventDefault()
  // console.log(option, id)
  
  if (doFollow) {
    postData("http://localhost:8000/api/v1/followers/", {userId: userId}).then(i => console.log(333, i))
  }
  deleteData("http://localhost:8000/api/v1/notifications-list/", {id: id}, false).then(i => {
    getData("http://localhost:8000/api/v1/notifications-list/")
      .then(data => {
        // d = data
        // console.log(data)
        if (data) {
          setNotifications(data)
        } else {
          setNotifications([])
        }
      })
  })
  let newNotif = []
  for (const i of notifications) {
    if (i.Id != id) {
      newNotif.push(i)
    }
  }
  // mockNotifications = newNotif

  // ws2OnMessage(setNotifications)

}
function handleJoin(doJoin, id, notifications, setNotifications, userId, catId) {
  if (doJoin) {
    putData("http://localhost:8000/api/v1/categories/", {userId: userId, catId: catId}).then(i => console.log(333, i))
  }
  deleteData("http://localhost:8000/api/v1/notifications-list/", {id: id}, false).then(i => {
    getData("http://localhost:8000/api/v1/notifications-list/")
      .then(data => {
        if (data) {
          setNotifications(data)
        } else {
          setNotifications([])
        }
      })
  })
  let newNotif = []
  for (const i of notifications) {
    if (i.Id != id) {
      newNotif.push(i)
    }
  }
}


function ws2OnMessage(setNotifications, notifications) {
  // if (count) {

  //   setCount(count + 1)
  //   return
  // }
  ws2.onmessage = function(event) {
    // let jsonData = JSON.parse(event.data)
    getData("http://localhost:8000/api/v1/notifications-list/")
    .then(data => {
      // d = data
      // console.log(data)
      if (data) {
        setNotifications(data)
      } else {
        setNotifications([])
      }
    })
    // setNotifications(mockNotifications)
  }
}
function NotificationDropdown({dispatch, setNotifications, notifications}) {
  

  useEffect(() => {

  }, [notifications])
  // let d;
  
  
  // console.log("data here: ", mockNotifications)
// 
  return (
    <>
      <div className={styles.arrowUpNotification}></div>

      <div className={styles.notificationDrop}>
        {notifications.map(item => {
          switch (item.Type) {
            case "follow": {
              return (
                <div key={item.Nickname} className={styles.notification} onSubmit={handleFollow}>
                  <img className={styles.notificationAvatar} alt="avatar" src={`http://localhost:8000/static/${item.UserAvatar}`} />
                  <span><strong>{item.Nickname}</strong><br/> has requested to follow you</span>
                  <button onClick={() => handleFollow(true, item.Id, notifications, setNotifications, item.UserId)} className={styles.notificationAcceptBtn}>Accept</button>
                  <button onClick={() => handleFollow(false, item.Id, notifications, setNotifications)} className={styles.notificationDeclineBtn}>Decline</button>
                  <hr />
                </div>
              )
            }
            case "event": {
              return (
                <div key={item.Nickname} className={styles.notification}>
                  <img className={styles.notificationAvatar} alt="avatar" src={`http://localhost:8000/static/${item.UserAvatar}`} />
                  <span><strong>{item.Nickname}</strong><br/> has created a new event in {item.CategoryTitle}</span>
                  <button className={styles.notificationAcceptBtn}>Join</button>
                  <button className={styles.notificationDeclineBtn}>Refuse</button>
                </div>
              )
            }
            case "join": {
              console.table(item)
              return (
                <div key={item.Nickname} className={styles.notification}>
                  <img className={styles.notificationAvatar} alt="avatar" src={`http://localhost:8000/static/${item.UserAvatar}`} />
                  <span><strong>{item.Nickname}</strong><br/> has requested to join your group <strong>{item.CategoryTitle}</strong></span>
                  <button onClick={() => handleJoin(true, item.Id, notifications, setNotifications, item.UserId, item.CatId)} className={styles.notificationAcceptBtn}>Accept</button>
                  <button onClick={() => handleJoin(false, item.Id, notifications, setNotifications)} className={styles.notificationDeclineBtn}>Decline</button>
                </div>
              )
            }
            default: {
              return <></>
            }
          }
        })}
      </div>
    </>
  )
}

export function TopBar({dispatch, state}) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getData("http://localhost:8000/api/v1/notifications-list/")
      .then(data => {
        // d = data
        // console.log(data)
        if (data) {
          setNotifications(data)
        } else {
          setNotifications([])
        }
      })
  }, [])
  ws2OnMessage(setNotifications, notifications)
  // const [count, setCount] = useState(0);
  // useEffect(() => {
  //   getData("http://localhost:8000/api/v1/notifications-list/")
  //   .then(data => {
  //     // d = data
  //     console.log(data)
  //     if (data) {
  //       let tempCount = 0
  //       for (const i in data) {
  //         tempCount += 1
  //       }
  //       setCount(tempCount)
  //     }
  //   })
  // }, [])

  // ws2OnMessage("setNotifications", setCount, count)

  let {nickname} = useAuth()
  let [avatar, setAvatar] = useState()

  if (!avatar) {
    fetch("http://localhost:8000/api/v1/users/nickname/" + nickname + "/")
      .then((item) => item.json().then(res =>  setAvatar(res[0].Avatar)))
  }

  return (
    <div className={styles.topbar}>
      <div className={styles.logo} onClick={() => {dispatch({type: "home"})}}>Meetup</div>
      <div className={styles.actions}>
        <div className={styles.notifications} onClick={() => dispatch({type: "notificationDrop"})}>
          <svg className={styles.bell} viewBox="0 0 24 24">
            <path fill="whitesmoke" d="M10 21h4l-2 2-2-2m11-2v1H3v-1l2-2v-6c0-3 2-6 5-7l2-2 2 2c3 1 5 4 5 7v6l2 2m-4-8c0-3-2-5-5-5s-5 2-5 5v7h10v-7Z"/>
          </svg>
        {notifications.length > 0 && <div className={styles.notificationCount}>{notifications.length > 9 ? "9+" : notifications.length}</div>}
        </div>
        <img className={styles.profile} alt="avatar" onClick={() => dispatch({type: "profileDrop"})}src={`http://localhost:8000/static/${avatar}`} />
      </div>
      {state.notificationDrop && <NotificationDropdown 
        dispatch={dispatch} 
        setNotifications={setNotifications}
        notifications={notifications}/>
      }
      {state.profileDrop && <ProfileDropdown dispatch={dispatch} />}
    </div>
  )
}
