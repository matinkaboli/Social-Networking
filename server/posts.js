const fs = require("fs");

function savePost(username, content, uniqueStr) {
  const dest = `/home/matin/Documents/projects/facebook/userpost/`;
  if (fs.existsSync(`${dest}${username}/`)) {
    fs.writeFile(`${dest}${username}/${uniqueStr}`, content, err => {
      if (err) throw err;
    });
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
