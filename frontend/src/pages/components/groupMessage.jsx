import { useRef, useState, useEffect, Fragment, createRef } from 'react';
import styles from './groupMessage.module.css'
import {useAuth} from '../../App'
import { ws, wsOnMessage } from '../../App'
import TimeAgo from 'timeago-react';
import InputEmoji from 'react-input-emoji'


let MESSAGES = []

const getMessages = (setMessages, messages, targetUser, mode = "default", nickname) => {
  let cookieStruct = {}

  for (const i of document.cookie.split("; ")) {
    let split = i.split("=")
    cookieStruct[split[0]] = split[1]
  }

  fetch(`http://localhost:8000/api/v1/group-messages/?targetId=${targetUser.groupChatId}`, {
    method: "GET",
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authentication': cookieStruct.session
    },
  }).then((response) => {
    response.json()
      .then ((xd) => {
        fetch("http://localhost:8000/api/v1/users/nickname/" + cookieStruct.uID + "/")
          .then(userResponse => {
            let prevSender = ""
            userResponse.json()
              .then((user) => {
                let messagesCopy = []
                xd?.forEach((elem) => {
                  if (elem.SenderName !== nickname && targetUser.groupChatId == elem.TargetId) {
                    if (prevSender !== elem.SenderName) {
                      prevSender = elem.SenderName
                      messagesCopy.push({
                        sent: false,
                        message: elem.Message,
                        date: elem.Date,
                        user: elem.SenderName
                      }) 
                    } else {
                      messagesCopy.push({
                        sent: false,
                        message: elem.Message,
                        date: elem.Date,
                      }) 
                    }
                  } else {
                    prevSender = elem.SenderName
                    messagesCopy.push({
                      sent: true,
                      message: elem.Message,
                      date: elem.Date,
                    }) 
                  }
                })
                setMessages(messagesCopy)
              })
          })
      })})
  return
}




export function GroupMessageBox({user, closeHandler, getOnlineUsers, dispatch, mode = "default"}) {
  // console.log("user", user)
  let lastmsg = useRef()
  const [messages, setMessages] = useState(MESSAGES)
  const [messageCount, setMessageCount] = useState(10)
  const messageScroll = createRef()
  const [prevTop, setPrevTop] = useState()
  const [loading, setLoading] = useState(false)
  const [ text, setText ] = useState('')
  const {nickname} = useAuth()

  useEffect(() => {
    getMessages(setMessages, messages, user, mode, nickname)
    setPrevTop(null)
    setMessageCount(10)
  }, [user])


  //ws.onmessage = function(event) {
  //  console.log("FA")
  //  let jsonData = JSON.parse(event.data)
  //  switch (jsonData.Type) {
  //    case "default":
  //      break
  //    case "groupMessage":
  //      if (jsonData.TargetId == user.groupChatId) {
  //        handleSubmit(jsonData, "groupMessage");
  //        break
  //      }
  //  }
  //}

  const handleSubmit = (message, mode = "default") => {
    let messagesCopy = [...messages]
    lastmsg.current?.scrollIntoView();

    // https://stackoverflow.com/questions/4673527/converting-milliseconds-to-a-date-jquery-javascript
    var time = new Date().getTime()
    var date = new Date(time)


    if (message.value !== "" && message.SenderName !== nickname && message.Type == 'groupMessage' && user.groupChatId == message.TargetId) {
      messagesCopy.push({sent: message.Sent, message: message.Message, date: date.toString().split("GMT")[0], user: message.SenderName}) 
      setMessages(messagesCopy)
    } else if (message.value !== "" && message.Type == 'groupMessage' && user.groupChatId == message.TargetId) {
      messagesCopy.push({sent: message.Sent, message: message.Message, date: date.toString().split("GMT")[0]}) 
      setMessages(messagesCopy)
    }
  }

  wsOnMessage(1, handleSubmit, 1, dispatch)
  useEffect(() => {
    let store = null
    const onScroll = (e) => {
      if (e.target.scrollTop === 0) {
        setPrevTop(e.target.scrollTopMax)
        setLoading(true)
        let c = messageCount
        setTimeout(() => setMessageCount(c + 10), 1000)
      }
    };

    if (messageScroll.current) {
      store = messageScroll.current
      if (prevTop && store.scrollTopMax !== prevTop) {
        store.scrollTop = store.scrollTopMax - prevTop
        setTimeout(() => setLoading(false), 1000)
      }
      store.addEventListener('scroll', onScroll)
    }
    return () => {
      if (store) store.removeEventListener('scroll', onScroll);
    }
  })

  useEffect(() => {
    lastmsg.current?.scrollIntoView();
    setPrevTop(null)
  }, [messages] )

  return (
    <div className={styles.messagebox}>
      <div className={styles.topbar}>
        <svg className={styles.groupChatIcon} viewBox="0 0 24 24">
          <path d="M12 6a4 4 0 0 1 4 3 4 4 0 0 1-4 4 4 4 0 0 1-3-4 4 4 0 0 1 3-3M5 8h2c-1 2 0 3 1 4l-3 2a3 3 0 0 1-3-3 3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3 3 3 0 0 1-3 3l-3-2c1-1 2-2 1-4h2M6 18c0-2 2-3 6-3s7 1 7 3v2H6v-2m-6 2v-1c0-2 2-3 4-3v4H0m24 0h-3v-2l-1-2c2 0 4 1 4 3v1Z"/>
        </svg>
        <span className={styles.nickname} onClick={() => dispatch({type: "category", category: `${user.groupChatId}` })}>{user.groupChatCat}</span>
        <div className={styles.close} onClick={(e) => {
          setMessageCount(0)
          dispatch({type: "groupChatClose"})
        }}>
          <svg  viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </div>
      </div> 
      <div className={styles.messages} ref={messageScroll}> {loading && messages.length-messageCount > 0 && <h1 className={styles.msgLoad}>Loading older messages</h1>}{messages.slice(messages.length-messageCount < 0 ? 0 : messages.length-messageCount).map((item, i) => {
        return (
          <Fragment key={i}>
            {item.user && <span className={styles.groupChatNickname} onClick={() => dispatch({type: "profile", category: `${item.user}` })}>{item.user}</span>}
            <TimeAgo className={item.sent ? styles.datesent : styles.datereceive} datetime={item.date} opts={{ minInterval:60}}/>
            <div className={styles.message} ><div className={item.sent ? styles.sent : styles.received}>{item.message}</div></div>
          </Fragment>
        )
      })}
        <div ref={lastmsg} className={styles.lastMsg} />

      </div>
      <div className={styles.submit} >
        <Textbox 
          scrollRef={lastmsg} 
          messages={messages} 
          setMessages={setMessages} 
          setCurrentMessage={setText} 
          currentMessage={text} 
          target={user} 
          mode={mode}
        />
      </div>
    </div>
  )
}

function Textbox({scrollRef, handleSubmit, messages, setMessages, currentMessage, setCurrentMessage, target, mode = "default"}) {
  function handleOnEnter (text) {
    console.log('enter', text)
    // const { id } = useParams();
    // console.log("Id here: ", id);
    if (text !== '') {
      let x = JSON.stringify({message: text, targetId: parseInt(target.groupChatId), mode: mode})
      ws.send(x)
    }
  }
  return (
    <InputEmoji
    value={currentMessage}
    onChange={setCurrentMessage}
    cleanOnEnter
    onEnter={handleOnEnter}
    placeholder="Type a message"
    theme="dark"
    />
  )
  //  return <div style={{height: `${(24*currentMessage.rows)}px`}}><textarea rows={currentMessage.rows} style={{top: `${414+(-24*currentMessage.rows)}px` }} value={currentMessage.value}
  //  className={styles.messageInput} placeholder={"Aa..."} onChange={handleChange} /></div>;
}
