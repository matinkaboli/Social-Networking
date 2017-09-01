const allposts = document.getElementsByClassName("onepost");


for (const i of allposts) {
  const input = i.getElementsByTagName("input")[0];
  input.addEventListener("click", () => {
    const _id = i.getElementsByTagName("p")[4].innerHTML;
    const likes = i.getElementsByTagName("span")[0];
    const configuration = {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        username,
        watcher,
        _id
      })
    };
    if (input.value === "LIKE") {
      fetch("/like", configuration)
        .then(checkStatus)
        .then(res => res.json())
        .then(data => {
          if (data.ok === false) {
            alert("Something is wrong");
          } else {
            input.value = "DISLIKE";
            likes.innerHTML = parseInt(likes.innerHTML) + 1;
          }
        });
    } else if (input.value === "DISLIKE") {
      fetch("/dislike", configuration)
        .then(checkStatus)
        .then(res => res.json())
        .then(data => {
          if (data.ok === false) {
            alert("Something is wrong");
          } else {
            input.value = "LIKE";
            likes.innerHTML = parseInt(likes.innerHTML) - 1;
          }
        });
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
