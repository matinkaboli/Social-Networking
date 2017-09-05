const lists = document.getElementById("lists").getElementsByTagName("main").length;

const configuration = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({ sp })
};

fetch("/getinfofollow", configuration)
  .then(checkStatus)
  .then(res => res.json())
  .then(data => {
    for (let i = 0; i < lists; i++) {
      document.getElementsByTagName("main")[i].
      getElementsByTagName("a")[0].innerHTML = data[i].username;
      document.getElementsByTagName("main")[i].
      getElementsByTagName("a")[0].href = `http://localhost:8080/user/${data[i].username}`;
      if (data[i].avatar == undefined) {
        document.getElementsByTagName("main")[i].
        getElementsByTagName("img")[0].src = "../default/man.jpg";
      } else {
        document.getElementsByTagName("main")[i].
        getElementsByTagName("img")[0].src = `../profile/${data[i].avatar}`;
      }
    }
  })
  .catch(e => {
    console.error(e);
  });

function checkStatus(res) {
  if (res.status >= 200 && res.status < 300) {
    return res;
  } else {
    const error = new Error(res.statusText);
    error.res = res;
    throw error;
  }
}
