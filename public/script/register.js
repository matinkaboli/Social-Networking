function checkUser(e,t){fetch(e,t).then(checkStatus).then(e=>e.json()).then(e=>{e.ok?/\ /.test(username.value)?(username.style.backgroundColor="#f03861",form.addEventListener("click",prevent)):(username.style.backgroundColor="#a6ed8e",form.removeEventListener("click",prevent)):(username.style.backgroundColor="#f03861",form.addEventListener("click",prevent))})}function checkEmail(e,t){fetch(e,t).then(checkStatus).then(e=>e.json()).then(e=>{e.ok?/\ /.test(email.value)?(email.style.backgroundColor="#f03861",form.addEventListener("click",prevent)):(email.style.backgroundColor="#a6ed8e",form.removeEventListener("click",prevent)):(email.style.backgroundColor="#f03861",form.addEventListener("click",prevent))})}function checkStatus(e){if(e.status>=200&&e.status<300)return e;{const t=new Error(e.statusText);throw t.res=e,t}}function prevent(e){e.preventDefault()}function validateEmail(e){const t=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;return console.log(t.test(e)),t.test(e)}function lastCheck(){return form.name.value.length>25?(alert("Name very too long."),!1):form.username.value.length>30?(alert("Username very too long."),!1):form.email.value.length>100?(alert("Email is very long."),!1):form.password.value.length>60?(alert("Password is very long."),!1):form.password.value.length<8?(alert("Password is very short."),!1):/\ /.test(form.username.value)?(alert("Write a standard username"),!1):form.password.value!==form.repassword.value?(alert("Make a right password."),!1):validateEmail(form.email.value)?(console.log("Email is valid"),!0):(alert("Make a right email."),!1)}const form=document.forms.register,username=form.username,email=form.email;username.addEventListener("input",()=>{checkUser("/checkusername",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({username:username.value.toLowerCase()})})}),email.addEventListener("input",()=>{checkEmail("/checkemail",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({email:email.value.toLowerCase()})})});