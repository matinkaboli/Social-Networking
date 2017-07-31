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
      res.render("admin.njk");
    } else {
      res.render("index.html");
    }
  });
  // Login page, using session.
  app.get("/login", auth, (req, res) => {
    res.render("admin.njk");
  });
  // Remove session and direct to Login page
  app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("login.njk");
  });
  // Register page, same as main page
  app.get("/register", (req, res) => {
    // Check session
    if (req.session && req.session.user) {
      res.render("admin.njk");
    } else {
      res.render("index.html");
    }
  });
  // Setting page for complete account options
  app.get("/setting", auth, (req, res) => {
    // Check db width username in the session.
    db.ckeckUserAndPassword(req.session.user, req.session.pass)
      .then(answer => {
        res.render("setting.njk", {
          data: answer[0]
        });
      })
      .catch(e => {
        res.send("Error...");
      });
  });
}

module.exports = gets;
