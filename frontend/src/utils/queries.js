export async function fetchPosts() {
  let cookies = document.cookie;
  let output = {};
  cookies.split(/\s*;\s*/).forEach(function (pair) {
    pair = pair.split(/\s*=\s*/);
    output[pair[0]] = pair.slice(1).join("=");
  });
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

export async function fetchGroups() {
  let cookies = document.cookie;
  let output = {};
  cookies.split(/\s*;\s*/).forEach(function (pair) {
    pair = pair.split(/\s*=\s*/);
    output[pair[0]] = pair.slice(1).join("=");
  });
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
