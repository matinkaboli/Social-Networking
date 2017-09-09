const allposts = document.getElementsByClassName("onepost");

makeLike();
function makeLike() {
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
          _id
        })
      };
      if (input.value === "LIKE") {
        getLike("/like", configuration, input, likes);
      } else if (input.value === "DISLIKE") {
        getLike("/dislike", configuration, input, likes);
      }
    });
  }
}
function getLike(url, configuration, input, likes) {
  fetch(url, configuration)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      if (url === "/like") {
        if (data.ok === false) {
        } else {
          input.value = "DISLIKE";
          likes.innerHTML = parseInt(likes.innerHTML) + 1;
        }
      } else if (url === "/dislike") {
        if (data.ok === false) {
        } else {
          input.value = "LIKE";
          likes.innerHTML = parseInt(likes.innerHTML) - 1;
        }
      }
    })
    .catch(e => {
      console.error(e);
    });
}
const morePost = document.getElementById("morepost");
morePost.addEventListener("click", () => {
  const enumerate = parseInt(morePost.getAttribute("enumerate"));
  const conf = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      enumerate,
      username,
      watcher,
    })
  };
  getMorePost(conf);

});
function getMorePost(conf) {
  fetch("/morepost", conf)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      morePost.setAttribute(
        "enumerate",
        parseInt(morePost.getAttribute("enumerate")) + 1
      );
      if (data.done) {
        morePost.style.display = "none";
      }
      const list = data.list;
      for(const i of list) {
        const posts = document.getElementById("posts");
        const newDiv = document.createElement("div");
        newDiv.style.backgroundColor = "red";
        newDiv.setAttribute("class", "onepost");

        const pTitle = document.createElement("p");
        const pTitleC = document.createTextNode(`Title: ${i.title}`);
        pTitle.setAttribute("id", "title");
        pTitle.appendChild(pTitleC);
        newDiv.appendChild(pTitle);

        const pTime = document.createElement("p");
        pTime.setAttribute("id", "time");
        const pTimeC = document.createTextNode(`Time: ${i.time}`);
        pTime.appendChild(pTimeC);
        newDiv.appendChild(pTime);

        const pContent = document.createElement("p");
        pContent.setAttribute("id", "content");
        const pContentC = document.createTextNode(`Content: ${i.content}`);
        pContent.appendChild(pContentC);
        newDiv.appendChild(pContent);

        const pLikes = document.createElement("p");
        const pLikesC = document.createTextNode("Likes: ");
        const spamLike = document.createElement("spam");
        const spamLikeC = document.createTextNode(i.likes.length);
        spamLike.appendChild(spamLikeC);
        pLikes.appendChild(pLikesC);
        pLikes.appendChild(spamLike);
        newDiv.appendChild(pLikes);

        const pID = document.createElement("p");
        pID.style.display = "none";
        const pidC = document.createTextNode(i._id);
        pID.appendChild(pidC);
        newDiv.appendChild(pID);

        if (i.like) {
          const inp = document.createElement("input");
          inp.setAttribute("type", "submit");
          inp.setAttribute("value", "DISLIKE");
          newDiv.appendChild(inp);
        } else {
          const inp = document.createElement("input");
          inp.setAttribute("type", "submit");
          inp.setAttribute("value", "LIKE");
          newDiv.appendChild(inp);
        }

        posts.appendChild(newDiv);
        makeLike();
      }
    })
    .catch(e => {
      console.error(e);
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
