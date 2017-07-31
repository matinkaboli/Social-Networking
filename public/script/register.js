const form = document.forms["register"];
const username = form.username;
const email = form.email;

username.addEventListener("input", () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      username: username.value.toLowerCase()
    })
  };
  checkUser("/checkuser", configuration);
});

email.addEventListener("input", () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
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
        if (/\ /.test(username.value)) {
          username.style.backgroundColor = "red";
          form.addEventListener("click", prevent);
        } else {
          username.style.backgroundColor = "green";
          form.removeEventListener("click", prevent);
        }
      } else {
        username.style.backgroundColor = "red";
        form.addEventListener("click", prevent);
      }
    });
}
function checkEmail(url, config) {
  fetch(url, config)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        if (/\ /.test(email.value)) {
          email.style.backgroundColor = "red";
          form.addEventListener("click", prevent);
        } else {
          email.style.backgroundColor = "green";
          form.removeEventListener("click", prevent);
        }
      } else {
        email.style.backgroundColor = "red";
        form.addEventListener("click", prevent);
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
function prevent(e) {
  e.preventDefault();
}
function lastCheck() {
  if (form.name.value.length > 25) {
    alert("Name very too long.");
    return false;
  }
  if (form.username.value.length > 30) {
    alert("Username very too long.");
    return false;
  }
  if (form.email.value.length > 100) {
    alert("Email is very long.");
    return false;
  }
  if (form.password.value.length > 60) {
    alert("Password is very long.");
    return false;
  }
  if (form.password.value.length < 8) {
    alert("Password is very short.");
    return false;
  }
  if (/\ /.test(form.username.value)) {
    alert("Write a standard username");
    return false;
  }
  if (form.password.value !== form.repassword.value) {
    alert("Make a right password.");
    return false;
  }
  return true;
}
