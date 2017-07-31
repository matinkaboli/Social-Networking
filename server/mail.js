function sendEm(nodemailer, to, text) {
  let transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "matinkaboli79@gmail.com",
      pass: "m@tinnim@125"
    }
  });
  let mailOption = {
    from: "matinkaboli79@gmail.com",
    subject: "Verify Email",
    html: text,
    to
  };
  transport.sendMail(mailOption, (err, info) => {
    if (err) throw err;
    console.log(`Email sent: ${into.response}`);
  });
}

module.exports = sendEm;
