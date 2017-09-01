const fs = require("fs");

const removeFile = filename => {
  fs.unlink(filename, err => {
    if (err) throw err;
  });
}

module.exports = removeFile;
