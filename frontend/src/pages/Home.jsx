import {LeftSideBar} from './components/left-sidebar'
import {RightSideBar} from './components/right-sidebar'
import {Feed} from './components/feed'
import { PostComponent } from './components/post'
import { useState, useEffect, useReducer, createRef } from 'react'
import { wsSetup } from './components/right-sidebar'
import {Group} from './components/group'
import {Profile} from './components/profile'

export default function Home({post, dispatch}) {
  useEffect(() => {
  wsSetup()
  }, [])
  
  const [scrollValue, setScrollValue] = useState(0);
  let feedScroll = createRef()

  useEffect(() => {
    window.history.pushState("Home.jsx:31", "Home.jsx:31", `/`)
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


  let postLayout = <div style={{overflowY: "scroll", overflowX: "hidden", width: "100%", minwidth: "100px"}}><PostComponent post={post.postId} dispatch={dispatch}/></div>


  return (
    <>
    <LeftSideBar dispatch={dispatch} />
    {post.postSelected ? postLayout : post.createGroup ? <Group/> : post.profile ? <Profile state={post} user={post.profileId}/> : <Feed forwardRef={feedScroll} scrollValue={scrollValue} selectedCat={post} dispatch={dispatch}/>}
    <RightSideBar dispatch={dispatch} />
    </>
  )
}
