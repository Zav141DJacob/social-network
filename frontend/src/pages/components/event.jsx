import React, {useState} from "react";
import * as timeago from "timeago.js";
import styles from "./event.module.css";
import {fetchEvent} from '../../utils/queries'
import { useQuery } from "@tanstack/react-query";
import {putData} from './topbar'
import {queryClient, useAuth} from './../../App'
import {partition} from 'lodash'

function handleAttend(doJoin, userId, eventId, setRefresh) {
  console.log("YA")
  if (doJoin) {
    putData("http://localhost:8000/api/v1/events/", {userId: userId, eventId: eventId, going: 1}).then(i => console.log(333, i))
  } else {
    putData("http://localhost:8000/api/v1/events/", {userId: userId, eventId: eventId, going: 0}).then(i => console.log(333, i))
  }
  queryClient.invalidateQueries(["event"])
}

export const Event = ({ state, dispatch }) => {
  const {userInfo} = useAuth()
  const {refresh, setRefresh} = useState()
  const {isError, isLoading, data: event} = useQuery(["event", state.eventId], fetchEvent)
  if (isLoading || isError) {
    return <div/>
  }
  let date
  if (event) {
    date = new Date(event[0].Event.Date)
  }

  let going = partition(event[0].Event.Attendees.slice(), (e) => e.Going === 1)
  return (
    <div className={styles.eventC}>
      <div className={styles.eventContainer}>
        <div className={styles.close} onClick={() => {dispatch({type: "eventClose"})}}>
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
            />
          </svg>
        </div>
        <div className={styles.host}>{event[0].Creator[0].Nickname}</div>
        <div className={styles.title}>{event[0].Event.Title}</div>
        <div className={styles.dateLabel}>Date</div>
        <div className={styles.date}>{date.toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " " + date.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })}</div>
        <div className={styles.descLabel}>Description</div>
        <div className={styles.desc}>{event[0].Event.Description}</div>
        <div className={styles.attends}>Going: {going[0].length}</div>
        <div className={styles.notattends}>Not going: {going[1].length}</div>
        <div className={styles.buttons}>
          {going[0].filter(e => e.UserId == userInfo.UserId).length > 0 ?
          <button  className={styles.notificationAcceptBtnDis}>Joined</button>
          :
          <button  onClick={() => handleAttend(true, userInfo.UserId, event[0].Event.EventId)} className={styles.notificationAcceptBtn}>Join</button>
          }
          {going[1].filter(e => e.UserId == userInfo.UserId).length > 0 ? 
          <button  className={styles.notificationDeclineBtnDis}>Refused</button>
          :
          <button  onClick={() => handleAttend(false, userInfo.UserId, event[0].Event.EventId)} className={styles.notificationDeclineBtn}>Refuse</button>
          }
        </div>
      </div>
    </div>
  );
};
