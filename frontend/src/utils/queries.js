export const findCookies = () => {
  let cookieStruct = {}

  for (const i of document.cookie.split("; ")) {
    let split = i.split("=")
    cookieStruct[split[0]] = split[1]
  }

  return cookieStruct
}

export async function fetchPosts() {
  let output = findCookies()
  return await fetch(`http://localhost:8000/api/v1/posts/`, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: { Authentication: output.session },
  }).then((response) =>
    response.json()
  );
}
export async function fetchPost({queryKey}) {
  let output = findCookies()
  let id = queryKey[1];
  return await fetch(`http://localhost:8000/api/v1/posts/?postId=${id}`, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: { Authentication: output.session },
  }).then((response) =>
    response.json()
  );
}

export async function fetchEvents() {
  let output = findCookies()
  return await fetch(`http://localhost:8000/api/v1/events/`, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: { Authentication: output.session },
  }).then((response) =>
    response.json()
  );
}

export async function fetchEvent({queryKey}) {
  let output = findCookies()
  let id = queryKey[1]
  return await fetch(`http://localhost:8000/api/v1/events/?eventId=${id}`, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: { Authentication: output.session },
  }).then((response) =>
    response.json()
  );
}

export async function fetchNotifications(setNotification) {
  let cookies = findCookies()
  let returnArr = {
    0: 0,
  }
  await fetch("http://localhost:8000/api/v1/notifications/", {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authentication': cookies.session,
    },
  })
    .then(resp => {
      resp.json()
        .then(notificationList => {
          if (notificationList != null) {
            notificationList.forEach((notif) => {
              if (!returnArr[notif.FromUserId]) {
                returnArr[notif.FromUserId] = 1
              } else {
                returnArr[notif.FromUserId]++
              }
            })
          } 
        })
      setNotification(returnArr)
    })
  return []
}

export async function fetchPostComments({queryKey}) {
  let id = queryKey[1];
  let output = findCookies();
  return await fetch(`http://localhost:8000/api/v1/comments/post/${id}/`, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: { Authentication: output.session },
  }).then((response) => {
    return response.json()
  }
  );
}

export async function fetchAvatar({queryKey}) {
  let id = queryKey[1];
  return await fetch("http://localhost:8000/api/v1/users/nickname/" + id + "/")
    .then((item) => item.json().then(res => {
      if (res?.length > 0) {
        return res[0]?.Avatar
      } else {
        return null
      }
    }))
}
export async function fetchGroups() {
  let output = findCookies();
  return await fetch(`http://localhost:8000/api/v1/categories/`, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
    headers: { Authentication: output.session },
  }).then((response) =>
    response.json()
  );
}
