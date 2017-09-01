const fs = require("fs");

const showData = address => {
  return new Promise((resolve, reject) => {
    fs.readFile(address, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  })
}

module.exports = showData;
