const fs = require("fs");

function removeFile(filename) {
  fs.unlink(filename, (err) => {
    if (err) throw err;
    console.log("Removed.");
  });
}

module.exports = removeFile;
