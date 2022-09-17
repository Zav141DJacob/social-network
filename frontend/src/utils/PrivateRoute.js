
import {TopBar} from '../pages/components/topbar'
import { Outlet, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
export const PrivateRoute = ({dispatch, state}) => {
   let cookies = document.cookie
  const [session, setSession] = useState()
   let output = {};
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/sessions/',
    {method: "GET", mode:'cors', cache:'no-cache', credentials: 'include',  headers: {Authentication: output.session}})
    .then(item => {
      if (item.status === 419 || item.status === 500) {
        setSession(23)
      }
    }).catch(() => setSession(23))
  }, [])
   if (!cookies) {
      return <Navigate to='/login' replace="true"/>
   }
    cookies.split(/\s*;\s*/).forEach(function(pair) {
        pair = pair.split(/\s*=\s*/);
        output[pair[0]] = pair.splice(1).join('=');
    });
  if (session === 23) {
    return <Navigate to='/login' replace />
  }
  return (
    <>
    <TopBar dispatch={dispatch} state={state} />
    <Outlet />
    </>
  )
}
