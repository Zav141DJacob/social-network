import React, { useRef, useEffect, useState } from "react";
import styles from "./almostPrivateSelection.module.css";

const AlmostPrivateSelection = ({ setViewers }) => {
  const [users, setUsers] = useState();
  const [addedUsers, setAddedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState();
  const myRef = useRef()

  if (!users) {
    const uList = fetch("http://localhost:8000/api/v1/users/", {})
      .then((res) => res.json())
      .then((res) => {
        setUsers(res);
      });
  }

  let fu = [];

  const onInput = (e) => {
    if (e.target.value.length > 0) {
      users.forEach((element) => {
        if (element.Nickname.startsWith(e.target.value)) {
          fu.push(element.Nickname);
        }
      });
    }
    setFilteredUsers(fu);
  };

  //add/remove users that will have access to post
  const modifyAddedUsers = (e, user, inputText) => {
    if ( 
      e.key === "Enter" &&
      !addedUsers.includes(e.target.value) &&
      filteredUsers.includes(e.target.value)
    ) {
      setAddedUsers((prev) => [...prev, e.target.value]);
      setFilteredUsers([])
      return;
    } else if (e == 0 && user && !addedUsers.includes(user) && filteredUsers.includes(user)) {
      setAddedUsers((prev) => [...prev, user]);
      inputText.current.value = ""
      setFilteredUsers([])
      return;
    }
    if (e?.target?.innerText) {
      let temp = addedUsers;
      temp = temp.filter((value) => value !== e.target.innerText);
      return setAddedUsers(temp);
    } else {
      let temp = addedUsers;
      temp = temp.filter((value) => value !== user);
      return setAddedUsers(temp);
    }
  };

  useEffect(() => {
    setViewers(addedUsers);
  }, [addedUsers]);

  return (
    <div>
      <div className="user-list" id="userList">
        <input
          ref={myRef}
          className={styles.search}
          list="users"
          placeholder="Search users..."
          onInput={onInput}
          onKeyUp={modifyAddedUsers}
        />
        {filteredUsers && (
          <div id="users" className={styles.users}>
            {filteredUsers.map((user) => {
              return <span key={user} className={styles.username} value={user} onClick={() => modifyAddedUsers(0, user, myRef)}>{user}</span>;
            })}
          </div>
        )}
      </div>
      <div className={styles.addedUsers}>
        {addedUsers &&
          addedUsers.map((viewer) => {
            return <p key={viewer} onClick={modifyAddedUsers}>{viewer} </p>;
          })}
      </div>
    </div>
  );
};

export default AlmostPrivateSelection;
