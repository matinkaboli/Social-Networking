const fol = document.getElementById("fol");
const UTF = document.getElementById("userToFollow");
const watcher = document.getElementById("watcher");

fol.addEventListener("click", () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      userToFollow: UTF.value,
      watcher: watcher.value
    })
  };
  if (fol.value === "FOLLOW") {
    followed("/follow", configuration);
  } else {
    followed("/unfollow", configuration);
  }
});
function followed(url, config) {
  fetch(url, config)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      if (data.fo === "unfollowed") {
        fol.value = "FOLLOW";
      } else if (data.fo === "followed") {
        fol.value = "UNFOLLOW";
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
