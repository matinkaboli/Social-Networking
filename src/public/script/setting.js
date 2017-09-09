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
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
function validateUsername(username) {
  const re = /^[a-zA-Z0-9]+([_ .]?[a-zA-Z0-9])*$/;
  return re.test(username);
}
function validatePassword(password) {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
  return re.test(password);
}

function checkFields() {
  if (!validateEmail(setting.email.value)) {
    alert("Write a correct email.");
    return false;
  }
  if (!validateUsername(setting.username.value)) {
    alert("Write a correct username.");
    return false;
  }
  return true;
}

const passForm = document.forms["changepass"];

function changePass() {
  if (passForm.newpassword.value !== passForm.repassword.value) {
    alert("New password and re-password are not the same");
    return false;
  }
  if (!validatePassword(passForm.newpassword.value)) {
    alert(`Your password should have at lease one
number, upper case letter and lower case letter and symbol
and at least 8 number.`);
    return false;
  }
  return true;
}
