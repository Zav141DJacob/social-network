import './App.css';
import {PrivateRoute} from './utils/PrivateRoute'
import { Routes, Route,  useNavigate } from 'react-router-dom';
import React, { Suspense, useReducer, useState, createContext, useContext, useEffect} from 'react'
import {ForwardWS2} from './utils/WsCases'
import {postData} from "./pages/Login"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
export const queryClient = new QueryClient()

const Home = React.lazy(() => import('./pages/Home'))
const Login = React.lazy(() => import('./pages/Login'))
let ws = {}
export {ws}
export const findCookies = () => {
  let cookieStruct = {}

  for (const i of document.cookie.split("; ")) {
    let split = i.split("=")
    cookieStruct[split[0]] = split[1]
  }

  return cookieStruct
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
export const wsOnMessage = (notification, setNotification, setUsers, dispatch, getNotifications, lat) => {
  ws.onmessage = function(event) {
    let jsonData = JSON.parse(event.data)
    switch (jsonData.Type) {
      case "registerEvent": {
        console.log(jsonData)
        dispatch({type: "event", eventId: jsonData.EventId}) 
        ForwardWS2(jsonData)
      }
      case "follow":
        ForwardWS2(jsonData)  
        break
      case "registerGroup":
        dispatch({type: "category", category: jsonData.CategoryId, catName: jsonData.CategoryTitle}) 
        window.history.pushState("y2", "x3", `/group/${jsonData.CategoryId}`)
        queryClient.invalidateQueries(["groups"])
        break
      case "join":
        ForwardWS2(jsonData)
        break
      case "groupMessage":
        setNotification(jsonData, "groupMessage")
        break
      default:
        postData("http://localhost:8000/api/v1/notifications/", {FromUserId: JSON.parse(event.data).SenderId}, false)
          .then(resp => {
            if (!getNotifications) {
              getNotifications = 
                async (notification, setNotification) => {
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
                          lat(returnArr)
                        })
                    }).catch(() => console.log("BAD THING in right-sidebar 49"))
                }
            }
            setNotification(jsonData, "default")
            getNotifications(notification, setNotification)
          })
          .catch(err => {
            console.log("found error in wsOnMessage!: ", err)
          })
    }
  }
}

export const AuthContext = createContext(null);

function postReducer(state, action) {
  const defaultFalse = {
    postSelected: false,
    postId: null,
    profile: false,
    profileDrop: false,
    notificationDrop: false,
    createGroup: false,
    event: false,
    eventId: null,
    profileId: undefined,
    postCat: undefined,
    public: undefined,
    following: false,
    followers: false,
    groupChat: state.groupChat,
    groupChatCat: state.groupChatCat,
    groupChatId: state.groupChatId,
    inviteGroup: false,
    messageBox: false
  }
  if (action.fat == 12) {
      return {...action, profileDrop: false, notificationDrop: false}
  }

  switch (action.type) {
    case 'select':
       return {...state, postSelected: true, postId: action.postId, profile: false, profileDrop: false}
    case 'unselect':
     window.history.pushState("Home.jsx:31", "Home.jsx:31", `/`)
      return {...state, postSelected: false, postId: null, profile: false, profileDrop: false, groupChat: state.groupChat, groupChatCat: state.groupChatCat} 
    case 'create':
      return {...defaultFalse, postSelected: true, postId: action.postId, profile: false, profileDrop: false, groupChat: state.groupChat, groupChatCat: state.groupChatCat}
    case 'category':
      return {...defaultFalse, postSelected: false, profile: false, profileDrop: false, catName: action.catName, postCat: action.category, public: action.public, groupChat: state.groupChat, groupChatCat: state.groupChatCat}
    case 'group':
      return {...defaultFalse, createGroup: true, groupChat: state.groupChat, groupChatCat: state.groupChatCat}
    case 'groupChat':
      return {...state, groupChat: true, groupChatCat: action.groupChatCat, groupChatId: action.groupChatId, messageBox: false}
    case 'groupChatClose':
      return {...state, groupChat: false}
    case 'inviteGroup': 
      return {...state, inviteGroup: true}
    case 'messageBoxOpen': 
      return {...state, messageBox: true}
    case 'messageBoxClose':
      return {...state, messageBox: false}
    case 'inviteGroupClose': 
      return {...state, inviteGroup: false}
    case 'profile':
      return {...defaultFalse, profile: true, profileId: action.Id, groupChat: state.groupChat, groupChatCat: state.groupChatCat}
    case 'profileDrop':
      return {...state, profileDrop: !state.profileDrop, notificationDrop: false}
    case 'notificationDrop':
      return {...state, notificationDrop: !state.notificationDrop, profileDrop: false}
    case 'createEvent':
      return {...state, notificationDrop: false, profileDrop: false, event: true}
    case 'event':
      return {...state,  notificationDrop: false, profileDrop: false, event: false, eventId: action.eventId}
    case 'eventClose':
      return {...state, event: false, eventId: undefined}
    case 'followers':
      return {...defaultFalse, followers: true, groupChat: state.groupChat, groupChatCat: action.groupChatCat}
    case 'following':
      return {...defaultFalse, following: true, groupChat: state.groupChat, groupChatCat: action.groupChatCat}
    case 'home':
     window.history.pushState("Home.jsx:31", "Home.jsx:31", `/`)
      return defaultFalse
    case 'logout':
      return {}
    default:
      throw Error('Unknown action', action.type)
  }
}

const AuthProvider = ({ children, dispatch }) => {
  const [token, setToken] = useState(null);
  const [nickname, setNickname] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const nav = useNavigate()
  let cookies = document.cookie
  let output = {};
  cookies.split(/\s*;\s*/).forEach(function(pair) {
    pair = pair.split(/\s*=\s*/);
    output[pair[0]] = pair.splice(1).join('=');
  });
  if (!token && output.session) {
    setToken(output.session);
    fetch("http://localhost:8000/api/v1/users/nickname/" + output.uID + "/")
      .then((item) => item.json().then(res =>  setUserInfo(res[0])))
  }
  if (!nickname && output.session) {
    fetch('http://localhost:8000/api/v1/sessions/',
      {method: "GET", mode:'cors', cache:'no-cache', credentials: 'include',  headers: {Authentication: output.session}})
      .then(item => item.json().then(i => {
        document.cookie = `uID=${i.Nickname}; path=/;`;
        setNickname(i.Nickname)
      }))
  }

  const handleLogout = () => {
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict";
    document.cookie = "uID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict";
    dispatch({type: "logout"})
    setToken(null);
    setUserInfo(null);
    setNickname(null)
    nav('/login', {replace:"true"})
  };

  const value = {
    token,
    nickname,
    userInfo,
    onLogout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};


function App() {
  const [post, dispatch] = useReducer(postReducer, {postSelected: false, createGroup: false, profile: false})
  const [previousState, setPreviousState] = useState([{...post, fat: 12, profileDrop: false, notificationDrop: false}])
  useEffect(() => {
    if (JSON.stringify(post) !== JSON.stringify(previousState.at(-1))) {
      let prevCopy = previousState.slice()
      prevCopy.push({...post, fat: 12, profileDrop: false, notificationDrop: false})
      setPreviousState(prevCopy)
    }
  }, [post])
  useEffect(() => {
    const handleClick = () => {
      let copyState = {...previousState.at(-2)}
      let prevCopy = previousState.slice()
      prevCopy.pop()
      setPreviousState(prevCopy)
      dispatch(copyState)
      window.history.pushState("Home.jsx:31", "Home.jsx:31", `/`)
    }

    window.addEventListener('popstate', handleClick);

    return () => {
      window.removeEventListener('popstate', handleClick);
    };
  });

  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <AuthProvider dispatch={dispatch}>
          <Suspense fallback={<div/>}>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route element={<PrivateRoute dispatch={dispatch} state={post}/>}>
                <Route path='/post/:postId' element={<Home dispatch={dispatch} post={post} />} />
                <Route path='/users/:userId' element={<Home dispatch={dispatch} post={post} />} />
                <Route path='/group/:groupId' element={<Home dispatch={dispatch} post={post} />} />
                <Route index element={<Home dispatch={dispatch} post={post} />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </div>
  );
}

export default App;
