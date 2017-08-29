const form = document.forms["setting"];
const username = form.username;
const email = form.email;

const us = document.getElementById("us");
const em = document.getElementById("em");

username.addEventListener("input", () => {
  const configuration = {
    credentials: "same-origin",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      username: username.value
    })
  };
  checkUser("/checkusername", configuration);
});

email.addEventListener("input", () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      email: email.value.toLowerCase()
    })
  };
  checkEmail("/checkemail", configuration);
});

function checkUser(url, config) {
  fetch(url, config)
  .then(checkStatus)
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      username.style.backgroundColor = "green";
    } else {
      if (username.value == oldUser) {
        username.style.backgroundColor = "green";
      } else {
        username.style.backgroundColor = "red";
      }
    }
  });
}
function checkEmail(url, config) {
  fetch(url, config)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
    if (data.ok) {
      email.style.backgroundColor = "green";
    } else {
      if (email.value === oldEmail) {
        email.style.backgroundColor = "green";
      } else {
        email.style.backgroundColor = "red";
      }
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
/* function getInfo() {
  const file = document.getElementById("ftu");
  console.log(file);
  const imageName = file[0].name.split('.');
  const ext = imageName[imageName.length - 1];
  if (ext === "jpg" || ext === "png") {
    return true;
  }
  alert("Upload an image...");
  return false;
} */
