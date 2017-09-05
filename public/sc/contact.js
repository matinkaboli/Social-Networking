const send = document.getElementById("send");
const name = document.getElementById("name");
const email = document.getElementById("email");
const content = document.getElementById("content");

send.addEventListener("click", () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      content: content.value
    })
  };
  sendEmail("/contact", configuration);
});
function sendEmail(url, configuration) {
  fetch(url, configuration)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        alert("Message has sent, thank you for feedback.");
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
