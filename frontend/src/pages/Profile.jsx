import {LeftSideBar} from './components/left-sidebar'
import {RightSideBar} from './components/right-sidebar'
import {Profile as ProfileComponent} from './components/profile'
import { useParams } from 'react-router-dom'
import { wsSetup } from './components/right-sidebar'
import { useEffect } from 'react'

export default function Profile({user, dispatch}) {
    const {userId} = useParams();
  console.log(userId)
    useEffect(() => {
      wsSetup()
    }, [])
    return (
    <>
      <LeftSideBar post={user} dispatch={dispatch} postPage={true}/>
      <div style={{overflowY: "scroll", overflowX: "hidden", width: "100%", minwidth: "100px"}}>
        <ProfileComponent userId={userId} state={user} dispatch={dispatch}/>
      </div>
      <RightSideBar dispatch={dispatch} />
    </>
    )
}
