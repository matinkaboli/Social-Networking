const { createTransport } = require("nodemailer");

const sendEm = (to, text, flag, username = 0) => {
  const transport = createTransport({
    service: "gmail",
    auth: {
      user: "matinkaboli79@gmail.com",
      pass: "m@tinnim@125"
    }
  });
  // Create a HTML page for email
  const mailOption = {
    from: "matinkaboli79@gmail.com",
    subject: "Verify Email",
    to
  };
  let HTML = `<!DOCTYPE html><html><head>
  </head><body>
  `;
  if (flag === 0) {
    HTML += `<p>Go to this link and you will complete the verification
    <a href="rootpath/token/${text}">HERE</a></p>`;
  } else if (flag === 1) {
    HTML += `<p>Go to this link to change your password
    <a href="rootpath/forgotchange/${text}">HERE</a></p>`;
  } else if (flag === 2) {
    HTML += `<p>Hello ${username}, someone is trying to
    log in to your account with
    this IP address = ${text}</p>
    <p>If it is you, then click on the blue button,
    otherwise click on the red button</p><p></p>
    <button style="background-color: red"><a href="/"></a></button>
    <button style="background-color: blue"><a href="/"></a></button>
    `;
  }
  HTML += `</body></html>`;
  mailOption.html = HTML;
  transport.sendMail(mailOption, (err, info) => {
    if (err) throw err;
  });
};

module.exports = sendEm;
