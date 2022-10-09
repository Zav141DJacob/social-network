import {LeftSideBar} from './components/left-sidebar'
import {RightSideBar} from './components/right-sidebar'
import {Feed} from './components/feed'
import {Event} from './components/event'
import { PostComponent } from './components/post'
import { useState, useEffect, createRef } from 'react'
import { ws2Setup } from './components/topbar'
import {Group} from './components/group'
import {Profile} from './components/profile'
import {EventCreator} from './components/eventCreator'
import {useParams} from 'react-router-dom'
import {wsSetup, wsOnMessage} from "../App"
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {fetchGroups} from '../utils/queries'


export default function Home({post, dispatch}) {
  const x = useParams()
  let poster = false;
  const [group, setGroup] = useState(true)
  const {data: groups} = useQuery(["groups"], fetchGroups, {
    select: (i) => i.filter(e => e.CatId == x.groupId),
    enabled: !!x.groupId,
    refetchOnMount: false
  })
  if (groups?.length > 0 && group) {
    dispatch({type: 'category', category: x.groupId, catName: groups[0].Title, postCat: x.groupId, public: groups[0].IsPublic, groupChatCat: groups[0].Title})
    setGroup(false)
  }
  useEffect(() => {
    if (x?.postId) {
      dispatch({type: "select"})
    }
    if (x?.userId) {
      dispatch({type: "profile", Id: x.userId})
    }
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
        {post.postSelected ? postLayout : post.createGroup ? <Group dispatch={dispatch}/> : post.event ? <EventCreator dispatch={dispatch} state={post}/> : post.eventId ? <Event dispatch={dispatch} state={post}/> : post.profile ? <Profile state={post} user={post.profileId} dispatch={dispatch}/> : <Feed forwardRef={feedScroll} state={post} scrollValue={scrollValue} selectedCat={post} dispatch={dispatch}/>}
        <RightSideBar dispatch={dispatch} state={post}/>
      </>
    )
}
