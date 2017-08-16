const title = document.getElementById("title");
const content = document.getElementById("content");
const sendpost = document.getElementById("sendpost");

sendpost.addEventListener("click", () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      title: title.value,
      content: content.value,
      username
    })
  };
  sendEmail("/sendpost", configuration);
});
function sendEmail(url, configuration) {
  fetch(url, configuration)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      console.log(data);
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
