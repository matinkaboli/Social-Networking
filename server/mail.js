const nodemailer = require("nodemailer");

const sendEm = (to, text, flag) => {
  const transport = nodemailer.createTransport({
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
  if (flag === 0) {
    const html = `Go to this link and you will complete the verification
    <a href="http://localhost/token/${text}">HERE</a>`;
    mailOption.html = html;
  } else if (flag === 1) {
    const html = `Go to this link to change your password
    <a href="http://localhost/forgotchange/${text}">HERE</a>`;
    mailOption.html = html;    
  }
  transport.sendMail(mailOption, (err, info) => {
    if (err) throw err;
  });
}

module.exports = sendEm;
