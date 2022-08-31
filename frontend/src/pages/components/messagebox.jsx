import { useRef, useState, useEffect, Fragment, createRef } from 'react';
import styles from './messagebox.module.css'
import { ws } from './right-sidebar'
import TimeAgo from 'timeago-react';
import InputEmoji from 'react-input-emoji'
// ws.onopen = function() {
//   ws.send(JSON.stringify({message: "Initializing Websocket Connection", senderId: 1, targetId: 0, init: true}))
// }


let MESSAGES = []

const getMessages = (setMessages, messages, targetUser) => {
  let cookieStruct = {}


  for (const i of document.cookie.split("; ")) {
    let split = i.split("=")
    cookieStruct[split[0]] = split[1]
  }


  fetch("http://localhost:8000/api/v1/messages/", {
    method: "GET",
    // mode: 'cors',
    // cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Authentication': cookieStruct.session
    },
  })
  .then((response) => {
    response.json()
  .then ((xd) => {

    fetch("http://localhost:8000/api/v1/users/nickname/" + cookieStruct.uID + "/")
    .then(userResponse => {
      userResponse.json()
      .then((user) => {
        let messagesCopy = []
        xd.forEach((elem) => {
          if (elem.SenderId == targetUser.UserId){
            if (elem.TargetId == user[0].UserId) {
              messagesCopy.push({
                sent: false,
                message: elem.Message,
                date: elem.Date
              }) 
            }
            
          } else if (elem.TargetId == targetUser.UserId) {
            // messagesCopy.push({sent: jsonData.Sent, message: jsonData.Message, date: date.toString().split("GMT")[0]}) 
            if (elem.SenderId == user[0].UserId ) {
              messagesCopy.push({
                sent: true,
                message: elem.Message,
                date: elem.Date
              }) 
            }
            
          }
        })
        setMessages(messagesCopy)
      })


    })
    
  })})

}


export function MessageBox({user, closeHandler, getOnlineUsers}) {

  // console.log("user", user)
  let lastmsg = useRef()
  const [messages, setMessages] = useState(MESSAGES)
  const [messageCount, setMessageCount] = useState(10)
  const messageScroll = createRef()
  const [prevTop, setPrevTop] = useState()
  const [loading, setLoading] = useState(false)
  const [ text, setText ] = useState('')

  useEffect(() => {
    getMessages(setMessages, messages, user)
    setPrevTop(null)
    setMessageCount(10)
  }, [user])

  ws.onmessage = function(event) {
    getOnlineUsers()
    let jsonData = JSON.parse(event.data)
    handleSubmit(jsonData);
  }

  const handleSubmit = (message) => {
      let messagesCopy = [...messages]
      lastmsg.current?.scrollIntoView();

      // https://stackoverflow.com/questions/4673527/converting-milliseconds-to-a-date-jquery-javascript
      var time = new Date().getTime()
      var date = new Date(time)

      messagesCopy.push({sent: message.Sent, message: message.Message, date: date.toString().split("GMT")[0]}) 

      if (message.value !== '') {
        setMessages(messagesCopy)
      }

  }
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
        <div className={user.Online ? styles.onlineIndicator : styles.offlineIndicator}></div>
        <span className={styles.nickname}>{user.Nickname}</span>
        <div className={styles.close} onClick={(e) => {
        setMessageCount(0)
        closeHandler(e)
        }}>
          <svg  viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </div>
      </div> 
      <div className={styles.messages} ref={messageScroll}> {loading && messages.length-messageCount > 0 && <h1 className={styles.msgLoad}>Loading older messages</h1>}{messages.slice(messages.length-messageCount < 0 ? 0 : messages.length-messageCount).map((item, i) => {
        return (
          <Fragment key={i}>
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
      />
      </div>
    </div>
  )
}

function Textbox({scrollRef, handleSubmit, messages, setMessages, currentMessage, setCurrentMessage, target}) {
  
      function handleOnEnter (text) {
        console.log('enter', text)
        ws.send(JSON.stringify({message: text, targetId: target.UserId, init: false}))
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
