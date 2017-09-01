const fs = require("fs");

const removeAllFiles = address => {
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

const removeUserData = username => {
  const address = `/home/matin/Documents/projects/facebook/userpost/${username}/`;
  if (fs.existsSync(address)) {
    removeAllFiles(address);
  }
}
const removeOldImage = address => {
  const dir = "/home/matin/Documents/projects/facebook/public/profile/";
  const full  = `${dir}${address}`;
  fs.unlink(full, err => {
    if (err) throw err;
  });
}

module.exports.removeOldImage = removeOldImage;
module.exports.removeUserData = removeUserData;
