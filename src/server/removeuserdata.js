const fs = require("fs");

const removeAllFiles = address => {
  const allFiles = fs.readdirSync(address);
  for (let i = 0; i < allFiles.length; i++) {
    fs.unlink(address + allFiles[i], err => {
      if (err) throw err;
    });
  }
  fs.rmdir(address, err => {
    if (err) throw err;
  });
};

const removeUserData = id => {
  const address = `maindir/userpost/${id}/`;
  if (fs.existsSync(address)) {
    removeAllFiles(address);
  }
};
const removeOldImage = address => {
  const dir = "BUILDDIRECTORY/public/profile/";
  const full  = `${dir}${address}`;
  fs.unlink(full, err => {
    if (err) throw err;
  });
};
const removePost = (id, db) => {
  db.Post.find({ user: id }).remove(err => {
    if (err) throw err;
  });
};
module.exports = {
  removePost,
  removeOldImage,
  removeUserData
}
