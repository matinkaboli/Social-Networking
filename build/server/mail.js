const{createTransport:createTransport}=require("nodemailer"),sendEm=(t,o,e,n=0)=>{const a=createTransport({service:"gmail",auth:{user:"matinkaboli79@gmail.com",pass:"m@tinnim@125"}}),i={from:"matinkaboli79@gmail.com",subject:"Verify Email",to:t};let r=`<!DOCTYPE html><html><head>\n  </head><body>\n  `;0===e?r+=`<p>Go to this link and you will complete the verification\n    <a href="http://localhost:3000/token/${o}">HERE</a></p>`:1===e?r+=`<p>Go to this link to change your password\n    <a href="http://localhost:3000/forgotchange/${o}">HERE</a></p>`:2===e&&(r+=`<p>Hello ${n}, someone is trying to\n    log in to your account with\n    this IP address = ${o}</p>\n    <p>If it is you, then click on the blue button,\n    otherwise click on the red button</p><p></p>\n    <button style="background-color: red"><a href="/"></a></button>\n    <button style="background-color: blue"><a href="/"></a></button>\n    `),r+=`</body></html>`,i.html=r,a.sendMail(i,(t,o)=>{if(t)throw t})};module.exports=((t,o,e,n=0)=>{const a=createTransport({service:"gmail",auth:{user:"matinkaboli79@gmail.com",pass:"m@tinnim@125"}}),i={from:"matinkaboli79@gmail.com",subject:"Verify Email",to:t};let r=`<!DOCTYPE html><html><head>\n  </head><body>\n  `;0===e?r+=`<p>Go to this link and you will complete the verification\n    <a href="http://localhost:3000/token/${o}">HERE</a></p>`:1===e?r+=`<p>Go to this link to change your password\n    <a href="http://localhost:3000/forgotchange/${o}">HERE</a></p>`:2===e&&(r+=`<p>Hello ${n}, someone is trying to\n    log in to your account with\n    this IP address = ${o}</p>\n    <p>If it is you, then click on the blue button,\n    otherwise click on the red button</p><p></p>\n    <button style="background-color: red"><a href="/"></a></button>\n    <button style="background-color: blue"><a href="/"></a></button>\n    `),r+=`</body></html>`,i.html=r,a.sendMail(i,(t,o)=>{if(t)throw t})});