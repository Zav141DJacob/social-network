import './App.css';
import {PrivateRoute} from './utils/PrivateRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Post from './pages/Post'
import {TopBar} from './pages/components/topbar'
import { Routes, Route,  useNavigate } from 'react-router-dom';
import { useReducer, useState, createContext, useContext} from 'react'


export const AuthContext = createContext(null);

function postReducer(state, action) {
  switch (action.type) {
    case 'select':
       return {...state, postSelected: true, postId: action.postId}
    case 'unselect':
      return {...state, postSelected: false, postId: null} 
    case 'create':
      return {postSelected: true, postId: action.postId}
    case 'category':
      return {postSelected: false, postCat: state.postCat === action.category ? 'all' : action.category}
    case 'group':
      return {postSelected: false, createGroup: true}
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
    {token && <TopBar/>}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};


function App() {
  const [post, dispatch] = useReducer(postReducer, {postSelected: false, createGroup: false})
  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path='/post/:postId' element={<Post dispatch={dispatch} post={post} />} />
            <Route index element={<Home dispatch={dispatch} post={post} />} />
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
