const form = document.forms["setting"];
const username = form.username;
const email = form.email;

const us = document.getElementById("us");
const em = document.getElementById("em");

username.addEventListener("input", () => {
  const configuration = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      username: user
    })
  };
  checkUser("/checkuser", configuration);
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
  fetch(url, config).then(checkStatus).then(res => res.json()).then(data => {
    if (data.ok) {
      if (/\ /.test(username.value)) {
        username.style.backgroundColor = "red";
        form.addEventListener("click", prevent);
      } else {
        username.style.backgroundColor = "green";
        form.removeEventListener("click", prevent);
      }
    } else {
      if (username.value === us.innerHTML) {
        username.style.backgroundColor = "green";
        form.removeEventListener("click", prevent);
      } else {
        username.style.backgroundColor = "red";
        form.addEventListener("click", prevent);
      }
    }
  });
}
function checkEmail(url, config) {
  fetch(url, config).then(checkStatus).then(res => res.json()).then(data => {
    if (data.ok) {
      if (/\ /.test(email.value)) {
        email.style.backgroundColor = "red";
        form.addEventListener("click", prevent);
      } else {
        email.style.backgroundColor = "green";
        form.removeEventListener("click", prevent);
      }
    } else {
      if (email.value === em.innerHTML) {
        email.style.backgroundColor = "green";
        form.removeEventListener("click", prevent);
      } else {
        email.style.backgroundColor = "red";
        form.addEventListener("click", prevent);
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
function prevent(e) {
  e.preventDefault();
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
