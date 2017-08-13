const fs = require("fs");

function savePost(username, content, uniqueStr) {
  const dest = `/home/matin/Documents/projects/facebook/userpost/`;
  // If this is not the first time that user posts
  if (fs.existsSync(`${dest}${username}/`)) {
    fs.writeFile(`${dest}${username}/${uniqueStr}`, content, err => {
      if (err) throw err;
    });
  // If this is the first time
  } else {
    fs.mkdir(`${dest}${username}`, err => {
      if (err) throw err;
      fs.writeFile(`${dest}${username}/${uniqueStr}`, content, err => {
        if (err) throw err;
      });
    });
  }
}

module.exports = savePost;
