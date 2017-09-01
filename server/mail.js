const nodemailer = require("nodemailer");

const sendEm = (to, text) => {
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
    text,
    to
  };
  transport.sendMail(mailOption, (err, info) => {
    if (err) throw err;
  });
}

module.exports = sendEm;
