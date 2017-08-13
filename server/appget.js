const showData = require("./showdata");

function gets(app, db) {
  // Auth users with session
  const auth = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    } else {
      res.render("login.njk");
    }
  };
  // Main page
  app.get("/", (req, res) => {
    if (req.session && req.session.user) {
      res.redirect("/admin");
    } else {
      res.render("index.html");
    }
  });
  // Login page, using session.
  app.get("/login", auth, (req, res) => {
    res.render("admin.njk");
  });
  // Register page, same as main page
  app.get("/register", (req, res) => {
    // Check session
    res.redirect("/");
  });
  // Setting page for complete account options
  app.get("/setting", auth, (req, res) => {
    // Check db width username in the session.
    db
      .checkUsername(req.session.user.toLowerCase(), req.session.pass)
      .then(answer => {
        res.render("setting.njk", {
          data: answer[0]
        });
      })
      .catch(e => {
        console.log(e);
        res.send("Error...");
      });
  });
  app.get("/admin", auth, (req, res) => {
    // Find the user
    const condition = {
      username: req.session.user,
      password: req.session.pass
    };
    db.User.find(condition, (err, answer) => {
      const postAddress = "/home/matin/Documents/facebook/userpost/";
      res.render("admin.njk", {
        data: answer[0]
      });
    });
  });
  app.get("/user/:username", (req, res) => {
    // User page
    const username = req.params.username.toLowerCase();
    const condition = { username };
    // Find if the user exists
    db.User.find(condition, (err, result) => {
      if (err) throw err;
      if (JSON.stringify(result) == "[]") {
        // If it doesn't
        res.render("usernotfound.njk", {
          url: username
        });
      } else {
        // If it does, look at the watcher(logged or not)
        if (req.session && req.session.user) {
          const userSes = req.session.user.toLowerCase();
          let con = {
            username: req.session.user.toLowerCase()
          };
          let isFollowed = result[0].follower;
          let finder = 0;
          // Did you follow him/her ?
          for (var i = 0; i < isFollowed.length; i++) {
            if (isFollowed[i].usern == userSes) {
              finder++;
            }
          }
          // If you didn't
          if (finder == 0) {
            res.render("userin.njk", {
              data: result[0],
              self: req.session.user,
              url: username,
              isFollowed: false
            });
          // If you did
          } else {
            res.render("userin.njk", {
              data: result[0],
              self: req.session.user,
              url: username,
              isFollowed: true
            });
          }
        } else {
          res.render("userout.njk", {
            data: result[0]
          });
        }
      }
    });
  });
  app.get("/contact", (req, res) => {
    res.render("contact.njk");
  });
  app.get("/user/:username/status/:address", (req, res) => {
    const us = req.params.username.toLowerCase();
    const ad = req.params.address;
    db.User.find({ username: us }, (err, tank) => {
      if (JSON.stringify(tank) == "[]") {
        res.send("Username Does not exist.");
      } else {
        function findAddress(element) {
          return element.address == ad;
        }
        let find = tank[0].posts.find(findAddress);
        if (find) {
          let userposts = "/home/matin/Documents/projects/facebook/userpost/";
          userposts += us;
          userposts += '/';
          userposts += find.address;
          showData(userposts)
            .then(result => {
              res.render("userpost.njk", {
                title: find.title,
                time: find.time,
                username: us,
                data: result
              });
            })
            .catch(e => {
              res.send("Error happened. Sorry");
            });
        } else {
          res.send("404 Error: not found.");
        }
      }
    });
  });
}

module.exports = gets;
