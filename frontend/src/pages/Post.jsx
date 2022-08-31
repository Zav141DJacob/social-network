import {LeftSideBar} from './components/left-sidebar'
import {RightSideBar} from './components/right-sidebar'
import {PostComponent} from './components/post'
import { useParams } from 'react-router-dom'
import { wsSetup } from './components/right-sidebar'
import { useEffect } from 'react'

export default function Post({post, dispatch}) {
    const {postId} = useParams();
    useEffect(() => {
      wsSetup()
    }, [])
    return (
    <>
      <LeftSideBar post={post} dispatch={dispatch} postPage={true}/>
      <div style={{overflowY: "scroll", overflowX: "hidden", width: "100%", minwidth: "100px"}}>
        <PostComponent post={postId} dispatch={dispatch}/>
      </div>
      <RightSideBar />
    </>
    )
}
