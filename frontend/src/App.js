import './App.css';
import {PrivateRoute} from './utils/PrivateRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import { Routes, Route,  useNavigate } from 'react-router-dom';
import { useReducer, useState, createContext, useContext, useEffect} from 'react'


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
    profileId: undefined,
    postCat: undefined,
    public: undefined,
    following: false,
    followers: false
  }
  if (action.fat == 12) {
      return {...action, profileDrop: false, notificationDrop: false}
  }

  switch (action.type) {
    case 'select':
       return {...state, postSelected: true, postId: action.postId, profile: false, profileDrop: false}
    case 'unselect':
     window.history.pushState("Home.jsx:31", "Home.jsx:31", `/`)
      return {...state, postSelected: false, postId: null, profile: false, profileDrop: false} 
    case 'create':
      return {...defaultFalse, postSelected: true, postId: action.postId, profile: false, profileDrop: false}
    case 'category':
      return {...defaultFalse, postSelected: false, profile: false, profileDrop: false, postCat: action.category, public: action.public}
    case 'group':
      return {...defaultFalse, createGroup: true}
    case 'profile':
      return {...defaultFalse, profile: true, profileId: action.Id}
    case 'profileDrop':
      return {...state, profileDrop: !state.profileDrop, notificationDrop: false}
    case 'notificationDrop':
      return {...state, notificationDrop: !state.notificationDrop, profileDrop: false}
    case 'createEvent':
      return {...state, notificationDrop: false, profileDrop: false, event: true}
    case 'followers':
      return {...defaultFalse, followers: true}
    case 'following':
      return {...defaultFalse, following: true}
    case 'home':
     window.history.pushState("Home.jsx:31", "Home.jsx:31", `/`)
      return defaultFalse
    default:
      throw Error('Unknown action', action.type)
  }
}

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [nickname, setNickname] = useState(null);
    const nav = useNavigate()
    let cookies = document.cookie
    let output = {};
    cookies.split(/\s*;\s*/).forEach(function(pair) {
        pair = pair.split(/\s*=\s*/);
        output[pair[0]] = pair.splice(1).join('=');
    });
    if (!token && output.session) {
      setToken(output.session);
      setNickname(output.uID)
    }

  const handleLogout = () => {
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict";
    document.cookie = "uID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict";
    setToken(null);
    nav('/login', {replace:"true"})
  };

  const value = {
    token,
    nickname,
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
      console.log(post)
      console.log(previousState.slice())
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
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route element={<PrivateRoute dispatch={dispatch} state={post}/>}>
            <Route path='/post/:postId' element={<Home dispatch={dispatch} post={post} />} />
            <Route path='/users/:userId' element={<Home dispatch={dispatch} post={post} />} />
            <Route path='/group/:groupId' element={<Home dispatch={dispatch} post={post} />} />
            <Route index element={<Home dispatch={dispatch} post={post} />} />
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
