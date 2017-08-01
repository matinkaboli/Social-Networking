const fs = require("fs");

function imageSize(Sharp, folname, filename) {
  const fulladdress = "/home/matin/Documents/projects/facebook/public/profile/";
  const readable = fs.createReadStream(
    fulladdress + filename
  );
  const writable = fs.createWriteStream(
    fulladdress + filename + "a"
  );
  const transformer = Sharp().resize(300, 300);
  readable.pipe(transformer).pipe(writable);
  fs.unlink(
    fulladdress + filename,
    err => {
      if (err) throw err;
    }
  );
}

module.exports = imageSize;
