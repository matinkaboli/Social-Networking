const newPost = document.getElementById("newpost");

window.onload = () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      username
    })
  };
  showP("/allposts", configuration);
}
function showP(url, configuration) {
  fetch(url, configuration)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      if (data.ok === false) {
        newPost.innerHTML = "User doesn't have any post.";
      } else {
        showPostToUser();
      }
    });
}
function showPostToUser() {
  if (data.posts.length > 10) {
    for (let i = 0; i < data.post.length; i++) {
      console.log(data.post[i]);
    }
  }
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
