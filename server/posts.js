const fs = require("fs");

const savePost = (id, content, uniqueStr) => {
  const dest = `/home/matin/Documents/projects/facebook/userpost/`;
  const conf = {
    flag: "a+"
  };
  // If this is not the first time that user posts
  if (fs.existsSync(`${dest}${id}/`)) {
    fs.writeFile(`${dest}${id}/${uniqueStr}`, content, conf, err => {
      if (err) throw err;
    });
  // If this is the first time
  } else {
    fs.mkdir(`${dest}${id}/`, err => {
      if (err) throw err;
      fs.writeFile(`${dest}${id}/${uniqueStr}`, content, conf, err => {
        if (err) throw err;
      });
    });
  }
}

module.exports = savePost;
