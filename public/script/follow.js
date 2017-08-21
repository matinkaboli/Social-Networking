const fol = document.getElementById("fol");
const countFollower = document.getElementById("count-follower");
const countFollowing = document.getElementById("count-following");

fol.addEventListener("click", () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      watcher
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
        countFollower.innerHTML = parseInt(countFollower.innerHTML) - 1;
      } else if (data.fo === "followed") {
        countFollower.innerHTML = parseInt(countFollower.innerHTML) + 1;
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
