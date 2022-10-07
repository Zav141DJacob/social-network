import styles from "./event.module.css";
import { ws, wsOnMessage } from "../../App";
import { useState, useEffect } from "react";
import { useAuth } from "./../../App";
import DtPicker from "react-calendar-datetime-picker";
import "react-calendar-datetime-picker/dist/index.css";

const DatePicker = () => {
  const [date, setDate] = useState(null);
  return (
    <DtPicker
      onChange={setDate}
      withTime
      showTimeInput //just show time in input
      showWeekend
      headerClass={styles.dateHeader}
    />
  );
};

// async function postData(url = '', data = {}) {
//   console.log(url, data);
//   // Default options are marked with *
//   const response = await fetch(url, {
//     method: 'POST',
//     mode: 'cors',
//     cache: 'no-cache',
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     redirect: 'follow',
//     referrerPolicy: 'no-referrer',
//     body: JSON.stringify(data)
//   });
// return response.json(); // parses JSON response into native JavaScript objects
// }

export function Event({ state, dispatch }) {
  const { nickname } = useAuth();
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [desc, setDesc] = useState();
  wsOnMessage(1, 1, 1, dispatch);

  function handleTitleChange(e) {
    setTitle(e.target.value);
    return;
  }
  return (
    <div className={styles.feed}>
      <div className={styles.creator}>
        <h1 style={{ position: "relative", top: "14px", color: "white" }}>
          Create an event
        </h1>
        <input
          className={styles.title}
          placeholder={"Give a title to your event, " + nickname + "!"}
          value={title}
          onChange={handleTitleChange}
        />
        <div className={styles.date}>
          <span style={{ color: "white", paddingRight: "10px" }}>
            Event start
          </span>
          <DatePicker />
        </div>
        <Description
          className={styles.description}
          catId={state.postCat}
          nickname={nickname}
          title={title}
          value={desc}
          visibility={visibility}
          dispatch={dispatch}
          setDesc={setDesc}
        />
      </div>
    </div>
  );
}

function Description({
  nickname,
  title,
  value,
  visibility,
  setDesc,
  dispatch,
  catId,
}) {
  function submitPost() {
    const postObj = {
      title: title,
      description: value,
      targetId: 2,
      catId: parseInt(catId),
    };
    ws.send(JSON.stringify({ ...postObj, mode: "registerEvent" }));
    //    ws.onmessage(({data: JSON.stringify({...postObj, Type: "registerEvent"})}))
  }
  if (title && value) {
    return (
      <>
        <textarea
          className={styles.description}
          value={value}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={"Description"}
        ></textarea>
        <div className={styles.submitready} onClick={submitPost}>
          Create
        </div>
      </>
    );
  }

  return (
    <>
      <textarea
        className={styles.description}
        value={value}
        onChange={(e) => setDesc(e.target.value)}
        placeholder={"Description"}
      ></textarea>
      <div className={styles.submit}>Create</div>
    </>
  );
}
