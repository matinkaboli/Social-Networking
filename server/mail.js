const nodemailer = require("nodemailer");

function sendEm(to, text) {
  let transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "matinkaboli79@gmail.com",
      pass: "m@tinnim@125"
    }
  });
  // Create a HTML page for email
  let mailOption = {
    from: "matinkaboli79@gmail.com",
    subject: "Verify Email",
    text,
    to
  };
  transport.sendMail(mailOption, (err, info) => {
    if (err) throw err;
  });
}

module.exports = sendEm;
