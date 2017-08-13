const showPosts = document.getElementById("showposts");
const user = document.getElementById("username");
window.onload = () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      username: username.innerHTML
    })
  };
  showP("/allposts", configuration);
}
function showP(url, configuration) {
  fetch(url, configuration)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        console.log(data.posts[0]);
      } else {
        console.log("Fuck");
      }
    });
}
function checkStatus(res) {
  if (res.status >= 200 && res.status < 300) {
    return res;
  } else {
    const error = new Error(res.statusText);
    error.res = res;
    throw error;
  }
}
