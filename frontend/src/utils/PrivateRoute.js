
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
        if (item.status === 419 || item.status === 500 || item.status === 401) {
          setSession(23)
        }
      }).catch(() => setSession(23))
  }, [])
  if (!cookies) {
    dispatch({type: "logout"})
    return <Navigate to='/login' replace="true"/>
  }
  cookies.split(/\s*;\s*/).forEach(function(pair) {
    pair = pair.split(/\s*=\s*/);
    output[pair[0]] = pair.splice(1).join('=');
  });
  if (session === 23) {
    dispatch({type: "logout"})
    return <Navigate to='/login' replace />
  }
  return (
    <>
      <TopBar dispatch={dispatch} state={state} />
      <Outlet />
    </>
  )
}

export function calculateCountdown(endDate) {
    let diff = (Date.parse(new Date(endDate)) - Date.parse(new Date())) / 1000;

    // clear countdown when date is reached
    if (diff <= 0) return false;

    const timeLeft = {
      years: 0,
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
      millisec: 0,
    };

    // calculate time difference between now and expected date
    if (diff >= (365.25 * 86400)) { // 365.25 * 24 * 60 * 60
      timeLeft.years = Math.floor(diff / (365.25 * 86400));
      diff -= timeLeft.years * 365.25 * 86400;
    }
    if (diff >= 86400) { // 24 * 60 * 60
      timeLeft.days = Math.floor(diff / 86400);
      diff -= timeLeft.days * 86400;
    }
    if (diff >= 3600) { // 60 * 60
      timeLeft.hours = Math.floor(diff / 3600);
      diff -= timeLeft.hours * 3600;
    }
    if (diff >= 60) {
      timeLeft.min = Math.floor(diff / 60);
      diff -= timeLeft.min * 60;
    }
    timeLeft.sec = diff;

    return timeLeft;
  }
