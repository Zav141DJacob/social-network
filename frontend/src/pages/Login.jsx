import "../App.css";
import React from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { findCookies } from "../utils/queries";

// Example POST method implementation:
export async function postData(url = "", data = {}, wantObject = true) {
  // Default options are marked with *
  let cookieStruct = findCookies();
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authentication: cookieStruct.session,
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  if (wantObject) {
    return response.json(); // parses JSON response into native JavaScript objects
  }
  return response;
}

export async function postImg(url = "", data = {}, boolean = true) {
  // Default options are marked with *
  let cookieStruct = findCookies();
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
    headers: {
      Authentication: cookieStruct.session,
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: data,
  });
  if (boolean) {
    return response.json(); // parses JSON response into native JavaScript objects
  }
  return response;
}
let credentials = {};

let loginFields = ["Nickname", "Password"];
let signupFields = [
  "Nickname",
  "Email",
  "Password",
  "ConfirmPassword",
  "FirstName",
  "LastName",
  "Age",
  "Bio",
  "Avatar",
];

function InputField({
  id,
  name,
  submitId,
  placeholder,
  onClick,
  onKeyDown,
  good,
  password,
  error,
  focus,
  setUserCreator,
  userCreator,
}) {
  let elemId = good ? id + "-good" : id;
  let errorId = good ? "error-good" : "error";
  let type = password
    ? "password"
    : placeholder == "Age"
    ? "date"
    : placeholder === "Avatar"
    ? "file"
    : "text";
  let submitBtnHeight = error?.[name] ? submitId + "-fail" : submitId;
  let errorCaption;
  if (error) {
    errorCaption =
      name === "Age" ? (
        <h3 id="error-caption" style={{ fontSize: "14px", top: "8px" }}>
          {error[name]}
        </h3>
      ) : (
        <h3 id="error-caption">{error[name]}</h3>
      );
  }
  return (
    <>
      <div id={elemId} key={name}>
        {(placeholder === "Age" || placeholder === "Avatar") && (
          <div className="fineinput">{placeholder}</div>
        )}
        <input
          className={placeholder + "-input"}
          id={id + "-input"}
          name={name}
          type={type}
          accept={type === "file" ? "image/png, image/jpg, image/gif" : ""}
          placeholder={placeholder}
          required={placeholder === "Age"}
          onKeyDown={onKeyDown}
          autoFocus={focus}
        />
        <div className="submit" id={submitBtnHeight} onClick={onClick}>
          <div id="plane">
            <svg
              id="planeSVG"
              width="30"
              height="30"
              viewBox="0 0 45 45"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                id="planePath"
                d="M0 25.3125L11.25 29.5312L16.875 45L24.9216 34.2563L39.375 39.375L45 0L0 25.3125ZM20.1628 32.175L17.5866 39.1641L14.5322 30.3947L38.1628 8.9325L20.1628 32.175Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
      </div>
      {error && Object.keys(error).includes(name) && (
        <div id={errorId}>{errorCaption}</div>
      )}
    </>
  );
}

export default function Login() {
  const [userCreator, setUserCreator] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [errorFields, setErrorFields] = React.useState(loginFields);
  const saveCredentials = (field, value) => {
    credentials = { ...credentials, [field]: value };
  };
  let navigate = useNavigate();

  const setupField = async (element) => {
    if (
      element.name === "ConfirmPassword" &&
      element.value !== credentials.Password
    ) {
      setError({ ...error, ConfirmPassword: "Passwords don't match" });
      return;
    } else if (element.name === "FirstName" && element.value === "") {
      setError({ ...error, FirstName: "First name cannot be empty" });
      return;
    } else if (element.name === "LastName" && element.value === "") {
      setError({ ...error, LastName: "Last name cannot be empty" });
      return;
    } else if (element.name === "Age" && element.value === "") {
      setError({ ...error, Age: "Age can't be empty" });
      return;
    } else if (element.name === "Avatar") {
      let formData = new FormData();
      let file = element.files[0];
      //check if user added avatar, else set default avatar
      if (file !== undefined) {
        formData.append("file", file);
        postImg("http://localhost:8000/api/v1/upload/", formData).then((x) =>
          saveCredentials("Avatar", x)
        );
      } else {
        saveCredentials("Avatar", "default-avatar.png");
      }
    } else if (
      (element.name === "Email" || element.name === "Password") &&
      element.value.length < 5
    ) {
      setError({ ...error, [element.name]: `${[element.name]} is too short!` });
      return;
    } else if (error && Object.keys(error).includes(element.name)) {
      let errCopy = { ...error };
      delete errCopy.Email;
      setError(errCopy);
      element.parentElement.id = element.parentElement.id.slice(0, -5);
      saveCredentials([element.name], element.value);
    } else {
      saveCredentials([element.name], element.value);
    }

    if (element.name === "LastName") {
      saveCredentials("LastName", element.value);
    }
    console.log(credentials);

    let fiield = errorFields.slice();
    fiield = fiield.filter((f) => {
      return f !== element.name;
    });
    flushSync(() => {
      setErrorFields(fiield);
    });

    let e = document.querySelector("#inputfield-good");
    if (e) {
      if (
        e.firstChild.className == "fineinput" &&
        e.firstChild.nextSibling.className == "Age-input"
      ) {
        e.firstChild.nextSibling.focus();
      } else {
        e.firstChild.focus();
      }
    } else {
      let r = document.querySelectorAll("#inputfield");
      if (r.length > 0) {
        if (r.length === 0) {
        } else {
          r[0].id += "-good";
          r[0].firstChild.focus();
        }
      } else {
        let x = document.querySelector("#pending-signup");
        let y = document.querySelector("#pending-login");
        if (x) {
          x.id += "-good";
        } else if (y) {
          y.id += "-good";
        } else {
        }
      }
    }

    let x = document.querySelector("#pending-login-good");
    let y = document.querySelector("#pending-signup-good");

    if (x) {
      setTimeout(() => {
        // x.id = 'pending-login'
        postData("http://localhost:8000/api/v1/sessions/", credentials).then(
          (item) => {
            flushSync(() => {
              setError(item);
              let invalidFields = { ...item };
              Object.keys(invalidFields).filter((i) => {
                if (invalidFields[i] === "") {
                  delete invalidFields[i];
                }
                return invalidFields[i] !== "";
              });
              if ("Name" in invalidFields) {
                document.cookie = `session=${invalidFields.Value}; path=/;`;
                document.cookie = `uID=${credentials.Nickname}; path=/;`;
                navigate("/", { replace: true });
              }
              setErrorFields([...Object.keys(invalidFields)]);
              if (Object.keys(invalidFields).length > 0) {
                x.id = "pending-login";
              } else {
                console.log("We are IN");
                // x.id = 'pending-login-good'
                navigate("/", { replace: true });
              }
              setErrorFields(Object.keys(item).filter((i) => item[i] !== ""));
            });
          }
        );
      }, 1000);
    } else if (y) {
      setTimeout(() => {
        postData("http://localhost:8000/api/v1/users/", credentials).then(
          (item) => {
            setError(item);
            let invalidFields = { ...item };
            Object.keys(invalidFields).filter((i) => {
              if (invalidFields[i] === "") {
                delete invalidFields[i];
              }
              return invalidFields[i] !== "";
            });
            setErrorFields([...Object.keys(invalidFields)]);
            if (Object.keys(invalidFields).length > 0) {
              y.id = "pending-signup";
            } else {
              navigate("/", { replace: true });
            }
            flushSync(() => {
              setErrorFields(Object.keys(item).filter((i) => item[i] !== ""));
            });
          }
        );
      }, 1000);
    }
  };

  function handleSubmit(e) {
    if (!e.bubbles) {
      postData("http://localhost:8000/api/v1/sessions/", e).then((item) => {
        flushSync(() => {
          let invalidFields = { ...item };
          if ("Name" in invalidFields) {
            document.cookie = `session=${invalidFields.Value}; path=/;`;
            document.cookie = `uID=${e.Nickname}; path=/;`;
            navigate("/", { replace: true });
          }
        });
      });
      return;
    } else {
      e.stopPropagation();
      let submitField;
      switch (e.target.id) {
        case "planePath": {
          submitField =
            e.target.parentElement.parentElement.parentElement
              .previousElementSibling;
          break;
        }
        case "planeSVG": {
          submitField =
            e.target.parentElement.parentElement.previousElementSibling;
          break;
        }
        case "plane": {
          submitField = e.target.parentElement.previousElementSibling;
          break;
        }
        default: {
        }
      }
      if (e.target.className === "submit") {
        submitField = e.target.previousElementSibling;
      }
      setupField(submitField).then();
    }
  }

  function handleKeyDown(event) {
    event.stopPropagation();
    if (event.key === "Tab") {
      event.preventDefault();
      return;
    }
    if (event.key === "Enter") {
      let element = event.target;
      setupField(element);
    }
  }

  function passwordClick(e) {
    e.target.value = "";
    setError(null);
    setErrorFields(["Password", ...errorFields]);
  }
  const jacobLogin = {
    Nickname: "Jacob",
    Password: "q1w2e3r4t5y6",
  };
  const alexLogin = {
    Nickname: "Alexxx",
    Password: "aaaaaaaa",
  };
  const kertuLogin = {
    Nickname: "Kertu",
    Password: "q1w2e3r4t5y6",
  };

  if (userCreator) {
    return (
      <div>
        <div className="login-module">
          <div id="topbar">
            <h1>SIGN UP</h1>
            {error?.[errorFields[0]] ? (
              <h3 style={{ color: "#f57870" }}>
                {" "}
                {errorFields[0] === "ConfirmPassword" ? (
                  <span onClick={passwordClick}>
                    Wrong password. Click to set new password
                  </span>
                ) : (
                  "Input error for " + errorFields[0]
                )}
              </h3>
            ) : (
              <h3>Fill in all the information</h3>
            )}
          </div>
          <div id="bottombar">
            {errorFields &&
              errorFields.map((bang, i) => {
                return (
                  <InputField
                    id="inputfield"
                    key={bang}
                    name={bang}
                    good={i === 0}
                    submitId="submit"
                    placeholder={bang}
                    onClick={handleSubmit}
                    onKeyDown={handleKeyDown}
                    error={error}
                    focus={i === 0}
                    password={bang === "Password" || bang === "ConfirmPassword"}
                  />
                );
              })}
            <div id="pending-signup">
              <h2 id="usercheck">Sign up complete</h2>
            </div>
            <div id="backfield"></div>
            {/* {error && <div id='error'><span></span></div> } */}
            <div
              id="oldUser"
              onClick={() => {
                setUserCreator(!userCreator);
                setErrorFields(loginFields);
                setError(null);
              }}
            >
              <h5>if you have an account click here to login</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="login-module">
        <div id="topbar">
          <h1>LOG IN</h1>
          {error?.length > 0 ? (
            <h3 style={{ color: "red" }}>Login failed. Please try again</h3>
          ) : (
            <h3>Fill in all the information</h3>
          )}
        </div>
        <div id="bottombar">
          {errorFields &&
            errorFields.map((bang, i) => {
              return (
                <InputField
                  id="inputfield"
                  key={error ? bang + error[bang] : bang}
                  name={bang}
                  good={i === 0}
                  submitId="submit"
                  placeholder={bang}
                  onClick={handleSubmit}
                  onKeyDown={handleKeyDown}
                  error={error}
                  password={bang === "Password" || bang === "ConfirmPassword"}
                  focus={i === 0}
                />
              );
            })}
          <div id="pending-login">
            <h2 id="usercheck">Confirming credentials</h2>
          </div>
          <div id="backfield"></div>
        </div>
      </div>
      <div
        id="newUser"
        onClick={() => {
          setUserCreator(!userCreator);
          setErrorFields(signupFields);
          setError(null);
        }}
      >
        <h5 style={{ textAlign: "center", cursor: "pointer" }}>
          or create a new user
        </h5>
        <h3
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => handleSubmit(jacobLogin)}
        >
          Jacob
        </h3>
        <h3
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => handleSubmit(alexLogin)}
        >
          Alex
        </h3>
        <h3
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => handleSubmit(kertuLogin)}
        >
          Kertu
        </h3>
      </div>
    </div>
  );
}
