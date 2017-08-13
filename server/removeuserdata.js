const fs = require("fs");

function removeAllFiles(address) {
  const allFiles = fs.readdirSync(address);
  for (var i = 0; i < allFiles.length; i++) {
    fs.unlink(address + allFiles[i], err => {
      if (err) throw err;
    });
  }
  fs.rmdir(address, err => {
    if (err) throw err;
  });
}

function removeUserData(username) {
  const address = `/home/matin/Documents/projects/facebook/userpost/${username}/`;
  if (fs.existsSync(address)) {
    removeAllFiles(address);
  }
}

module.exports = removeUserData;
