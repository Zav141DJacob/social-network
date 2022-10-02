import { useEffect, useState } from 'react'
import styles from './rightsidebar.module.css'
import { MessageBox } from './messagebox.jsx'
import { GroupMessageBox } from './groupMessage.jsx'
import { postData } from '../Login'
import { FollowCase } from '../../utils/WsCases'
import { getData } from './topbar'


export { ws }

let ws = {}

export const findCookies = () => {
  let cookieStruct = {}

  for (const i of document.cookie.split("; ")) {
    let split = i.split("=")
    cookieStruct[split[0]] = split[1]
  }

  return cookieStruct
}

const getNotifications = async (notification, setNotification) => {
  let cookies = findCookies()
  await fetch("http://localhost:8000/api/v1/notifications/", {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authentication': cookies.session,
    },
  })
    .then(resp => {
      resp.json()
        .then(notificationList => {
          let returnArr = {
            0: 0,
          }
          if (notificationList != null) {
            notificationList.forEach((notif) => {
              if (!returnArr[notif.FromUserId]) {
                returnArr[notif.FromUserId] = 1
              } else {
                returnArr[notif.FromUserId]++
              }
            })
          } 

          setNotification(returnArr)
        })
    }).catch(() => console.log("BAD THING in right-sidebar 49"))
}
export const wsOnMessage = (notification, setNotification, setUsers, dispatch) => {
  ws.onmessage = function(event) {
    let jsonData = JSON.parse(event.data)
    console.log(jsonData)
    if (jsonData.CategoryId) {
      console.log(2312)
      dispatch({type: "category", category: jsonData.CategoryId}) 
      window.history.pushState("y2", "x3", `/group/${jsonData.CategoryId}`)
    }
    switch (jsonData.Type) {
      case "follow":
        FollowCase(jsonData)  
        break
      case "groupMessage":
        break
      default:
        getOnlineUsers(notification, setNotification, setUsers)
        postData("http://localhost:8000/api/v1/notifications/", {FromUserId: JSON.parse(event.data).SenderId}, false)
          .then(resp => {
            getNotifications(notification, setNotification)
          })
          .catch(err => {
            console.log("found error in wsOnMessage!: ", err)
          })
    }
  }
}
const deleteNotification = (fromUserId, notification, setNotification) => {
  fetch('http://localhost:8000/api/v1/notifications/', { 
    method: 'DELETE',
    headers: {
      Authentication: findCookies().session,
    },
    body: JSON.stringify({
      FromUserId: fromUserId
    }),
  })
    .then(() => {
      getNotifications(notification, setNotification)
    });
  // console.log("delete")
}
export const wsSetup = () => {

  if (ws.readyState != 0) {
    ws = new WebSocket("ws://localhost:8000/ws/")
  } 

  let cookieStruct = findCookies()

  let nickname = cookieStruct.uID

  ws.onopen = function() {
    ws.send(JSON.stringify({nickname: nickname, mode: "register"}))
  }

}

const getOnlineUsers = (notification, setNotification, setUsers) => {
  const cookieStruct = findCookies()
  fetch('http://localhost:8000/api/v1/online-users/', {
    method: "GET",
    headers: {
      Authentication: cookieStruct.session,
    },
  }).then(item => {
    item.json().then((res) => {
      
      setUsers(res)
      // getUserListOrder(users, setUsers, res)
      getNotifications(notification, setNotification)
    })
  })
}

export function RightSideBar({dispatch, state}) {
  const [users, setUsers] = useState(null)
  const [messageboxOpen, setMessageboxOpen] = useState(false)
  const [messageUser, setmessageUser] = useState(null)
  const [notification, setNotification] = useState({
    0: 0,
  })
  const closeMessageBox = () => {
    wsOnMessage(notification, setNotification, setUsers, dispatch)
    setMessageboxOpen(false)
  }

  // useEffect(() => {
  //   wsSetup()
  // }, [])
  useEffect(() => {
    wsOnMessage(notification, setNotification, setUsers, dispatch)
    getOnlineUsers(notification, setNotification, setUsers)
  }, [])

  if (users) {
    return (
      <div className={styles.sidebar}>
        {users.map(item => {
          return (
            <div key={item.UserId} className={styles.user}>
              <img className={styles.profilePicture} src={`http://localhost:8000/static/${item.Avatar}`}  /> 
              <div className={item.Online ? styles.onlineIndicator : styles.offlineIndicator}>
                {notification[item.UserId] && <div className={styles.notificationCount}>{notification[item.UserId] > 9 ? "9+" : notification[item.UserId]}</div>}
              </div>
              <h1 className={styles.nickname} onClick={() => {
                dispatch({type: "groupChatClose"})
                setmessageUser(item)
                setMessageboxOpen(true)
                deleteNotification(item.UserId, notification, setNotification)
              }}>{item.Nickname} </h1>
              {notification[item.UserId] && <div className={styles.notification} />}
            </div>
          )
        })}
        {messageboxOpen && <MessageBox dispatch={dispatch} user={messageUser} closeHandler={closeMessageBox} getOnlineUsers={()=>{getOnlineUsers(notification, setNotification, setUsers)}}/>}
        {state?.groupChat && <GroupMessageBox dispatch={dispatch} user={state} closeHandler={closeMessageBox} mode={"groupMessage"} getOnlineUsers={()=>{getOnlineUsers(notification, setNotification, setUsers)}}/>}
      </div>
    )
  }
  return (
    <div className={styles.sidebar}>
    </div>
  )
}

//        {
//          () => {
//            
//            getData("http://localhost:8000/api/v1/categories/")
//            .then(categoryResponse => {
//              console.log(categoryResponse)
//            }) 
//          }
//        }
