import React, { useEffect, useState } from "react";
import styles from "./almostPrivateSelection.module.css";

const AlmostPrivateSelection = ({ setViewers }) => {
  const [users, setUsers] = useState();
  const [addedUsers, setAddedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState();

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
  const modifyAddedUsers = (e) => {
    if (
      e.key === "Enter" &&
      !addedUsers.includes(e.target.value) &&
      filteredUsers.includes(e.target.value)
    ) {
      setAddedUsers((prev) => [...prev, e.target.value]);
      return;
    }
    if (e.target.innerText) {
      let temp = addedUsers;
      temp = temp.filter((value) => value !== e.target.innerText);
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
          className={styles.search}
          list="users"
          placeholder="Search users..."
          onInput={onInput}
          onKeyUp={modifyAddedUsers}
        />
        {filteredUsers && (
          <datalist id="users">
            {filteredUsers.map((user) => {
              return <option value={user} />;
            })}
          </datalist>
        )}
      </div>
      <div className={styles.addedUsers}>
        {addedUsers &&
          addedUsers.map((viewer) => {
            return <p onClick={modifyAddedUsers}>{viewer} </p>;
          })}
      </div>
    </div>
  );
};

export default AlmostPrivateSelection;
