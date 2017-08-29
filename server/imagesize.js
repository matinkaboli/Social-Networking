const Sharp = require("sharp");
const fs = require("fs");
// Get user avatar and make it 300x300
function imageSize(filename) {
  const fulladdress = "/home/matin/Documents/projects/facebook/public/profile/";
  const readable = fs.createReadStream(fulladdress + filename);
  const writable = fs.createWriteStream(fulladdress + filename + "a");
  const transformer = Sharp().resize(300, 300);
  readable.pipe(transformer).pipe(writable);
  setTimeout(() => {
    fs.unlink(fulladdress + filename, err => {
      if (err) throw err;
    });
  }, 2);
}

module.exports = imageSize;
