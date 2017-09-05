const form = document.forms["register"];
const username = form.username;
const email = form.email;

// With every letter that user types.
username.addEventListener("input", () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      username: username.value.toLowerCase()
    })
  };
  checkUser("/checkusername", configuration);
});
// With every letter that user types.
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
  fetch(url, config).then(checkStatus).then(res => res.json()).then(data => {
    // If user hasent taken
    if (data.ok) {
      // If username has space
      if (/\ /.test(username.value)) {
        username.style.backgroundColor = "#f03861";
        form.addEventListener("click", prevent);
      } else {
        // If everything was OK
        username.style.backgroundColor = "#a6ed8e";
        form.removeEventListener("click", prevent);
      }
    } else {
      username.style.backgroundColor = "#f03861";
      form.addEventListener("click", prevent);
    }
  });
}
function checkEmail(url, config) {
  fetch(url, config)
    .then(checkStatus)
    .then(res => res.json())
    .then(data => {
      // If email hasent taken
      if (data.ok) {
        // If username has space
        if (/\ /.test(email.value)) {
          email.style.backgroundColor = "#f03861";
          form.addEventListener("click", prevent);
        } else {
          // If everything was OK
          email.style.backgroundColor = "#a6ed8e";
          form.removeEventListener("click", prevent);
        }
      } else {
        email.style.backgroundColor = "#f03861";
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
// Dont let user register
function prevent(e) {
  e.preventDefault();
}
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    console.log(re.test(email));
    return re.test(email);
}
// Before submit
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
  if (validateEmail(form.email.value)) {
    console.log("Email is valid");
  } else {
    alert("Make a right email.");
    return false;
  }
  return true;
}
