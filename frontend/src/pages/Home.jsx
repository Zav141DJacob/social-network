import {LeftSideBar} from './components/left-sidebar'
import {RightSideBar} from './components/right-sidebar'
import {Feed} from './components/feed'
import { PostComponent } from './components/post'
import { useState, useEffect, useReducer, createRef } from 'react'
import { wsSetup } from './components/right-sidebar'
import {Group} from './components/group'
import {Profile} from './components/profile'
import {Event} from './components/event'
import {useParams} from 'react-router-dom'
import { ws2Setup } from './components/topbar'

export default function Home({post, dispatch}) {
  const x = useParams()
  let poster = false;
  useEffect(() => {
    if (x?.postId) {
      dispatch({type: "select"})
    }
    if (x?.userId) {
      dispatch({type: "profile", Id: x.userId})
    }
    if (x?.groupId) {
      let cookies = document.cookie
      let output = {};
      cookies.split(/\s*;\s*/).forEach(function(pair) {
        pair = pair.split(/\s*=\s*/);
        output[pair[0]] = pair.slice(1).join('=');
      });
      fetch('http://localhost:8000/api/v1/categories/',
        {method: "GET", mode:'cors', cache:'no-cache', credentials: 'include',  headers: {Authentication: output.session}})
        .then(item => {
          item.json().then(item => {
            let n = item.filter(i => i.CatId == x.groupId)
            dispatch({type: 'category', category: x.groupId, catName: n[0].Title, postCat: x.groupId, public: n[0].IsPublic, groupChatCat: n[0].Title})
          })
        })
    }
    ws2Setup()
    wsSetup()
  }, [])

  const [scrollValue, setScrollValue] = useState(0);
  let feedScroll = createRef()

  useEffect(() => {
    let store = null
    const onScroll = () => {
      setScrollValue(store.scrollTop);
    };

    if (feedScroll.current) {
      store = feedScroll.current
      store.addEventListener('scroll', onScroll)
    }

    return () => {
      if (store) store.removeEventListener('scroll', onScroll);
    }
  }, [feedScroll, scrollValue]);

  let posty = post?.postId ? post.postId : x.postId

  let postLayout = <div style={{overflowY: "scroll", overflowX: "hidden", width: "100%", minwidth: "100px"}}><PostComponent post={posty} dispatch={dispatch}/></div>


    return (
      <>
        <LeftSideBar dispatch={dispatch} state={post}/>
        {post.postSelected ? postLayout : post.createGroup ? <Group/> : post.event? <Event/> : post.profile ? <Profile state={post} user={post.profileId} dispatch={dispatch}/> : <Feed forwardRef={feedScroll} state={post} scrollValue={scrollValue} selectedCat={post} dispatch={dispatch}/>}
        <RightSideBar dispatch={dispatch} state={post}/>
      </>
    )
}
