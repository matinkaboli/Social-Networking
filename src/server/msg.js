const fs = require("fs");
const stringing = require("stringing");

const saveMessage = (name, email, text) => {
  // Save contact us in messages directory
  const msg = `Name: ${name}
Email: ${email}
text: ${text}`;
  const gen = stringing.unique(30);
  const dest = `maindir/messages/${gen}.txt`;
  fs.writeFile(dest, msg, err => {
    if (err) throw err;
  });
}

module.exports = saveMessage;
