import React, {useEffect, useState} from "react";
import * as timeago from "timeago.js";
import styles from "./event.module.css";
import {fetchGroups, fetchEvent, fetchGuests} from '../../utils/queries'
import { useQuery } from "@tanstack/react-query";
import {putData} from './topbar'
import {queryClient, useAuth, ws} from './../../App'
import {partition} from 'lodash'

function handleAttend(doJoin, userId, eventId) {
  if (doJoin) {
    putData("http://localhost:8000/api/v1/events/", {userId: userId, eventId: eventId, going: 1}).then(i => console.log(333, i))
  } else {
    putData("http://localhost:8000/api/v1/events/", {userId: userId, eventId: eventId, going: 0}).then(i => console.log(333, i))
  }
  queryClient.invalidateQueries(["guests"])
}

export const Event = ({ state, dispatch }) => {
  const {userInfo, nickname} = useAuth()
  const [invited, setInvited] = useState([])
  const {isError, isLoading, data: event, isFetching, isRefetching} = useQuery(["event", state.eventId], fetchEvent)
  const {data: guests} = useQuery(["guests", state.eventId], fetchGuests)
  const { data: groups } = useQuery(["groups"], fetchGroups, {
    select: (i) => i.filter((e) => e.CatId == state.postCat),
    refetchOnMount: false,
  });

  function inviteEvent(userId) {
    let inviteCp = invited.slice()
    inviteCp.push(userId)
    setInvited(inviteCp)
    const postObj = { eventId: parseFloat(state.eventId), nickname: nickname, userId: userId };
    ws.send(JSON.stringify({ ...postObj, mode: "inviteEvent" }));
  }

  let going
  let possibleInvites

  if (isLoading || isError || isFetching || isRefetching) {
    return <div>LOADING</div>
  }
  let date
  if (event && guests && groups) {
    possibleInvites = groups[0].Members.filter(e => !guests[0].Guests.includes(e.UserId))
    date = new Date(event[0].Event.Date)
    going = partition(guests[0].Guests.slice(), (e) => e.Going === 1)
  }

  if (going && date) {
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
          <button onClick={() => dispatch({ type: "inviteEvent" })} className={styles.inviteBtn} >Invite</button>
          {state?.inviteEvent && (
            <div className={styles.inviteModal}>
              <div className={styles.arrowUp}></div>
              <div
                className={styles.closeModal}
                onClick={() => dispatch({ type: "inviteEventClose" })}
              >
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
                </svg>
              </div>
              <span className={styles.moduleLabel}>
                Invite people to {event[0].Event.Title}
              </span>
              {possibleInvites &&
                 possibleInvites.map((follower) => {
                    return (
                      <div key={follower.UserId} className={styles.follower}>
                        {follower.Avatar && (
                          <div className={styles.followerAvatar}>
                            <img
                              className={styles.followerAvatarImg}
                              src={`http://localhost:8000/static/${follower.Avatar}`}
                            />
                          </div>
                        )}
                        <div
                          className={styles.followerNickname}
                          onClick={() =>
                              dispatch({
                                type: "profile",
                                Id: `${follower.Username}`,
                              })
                          }
                        >
                          {follower.Username}
                        </div>
                        {invited.includes(follower.UserId) ? 
                          <button className={styles.invitedUserBtn}>Invited</button>
                          :
                          <button className={styles.inviteUserBtn} onClick={() => inviteEvent(follower.UserId)}>Invite</button>
                        }
                      </div>
                    );
                  })}
            </div>
          )}
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
  }
}
