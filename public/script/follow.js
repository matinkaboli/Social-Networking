const fol = document.getElementById("fol");
const UTF = document.getElementById("userToFollow");
const watcher = document.getElementById("watcher");
const count = document.getElementById("count");

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
        count.innerHTML = parseInt(count.innerHTML) - 1;
      } else if (data.fo === "followed") {
        count.innerHTML = parseInt(count.innerHTML) + 1;
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
