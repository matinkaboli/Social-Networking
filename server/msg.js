const fs = require("fs");
const stringing = require("stringing");

function saveMessage(name, email, text) {
  const msg = `Name: ${name}
Email: ${email}
text: ${text}`;
  const gen = stringing.unique(30);
  const dest = `/home/matin/Documents/projects/facebook/messages/${gen}.txt`;
  fs.writeFile(dest, msg, err => {
    if (err) throw err;
  });
}

module.exports = saveMessage;