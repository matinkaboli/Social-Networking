const fs = require("fs");

function removeFile(filename) {
  fs.unlink(filename, err => {
    if (err) throw err;
  });
}

module.exports = removeFile;
