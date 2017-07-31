function gets(app, db) {
  const auth = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    } else {
      res.render("login.njk");
    }
  };
  app.get("/", (req, res) => {
    if (req.session && req.session.user) {
      res.render("admin.njk");
    } else {
      res.render("index.html");
    }
  });
  app.get("/login", auth, (req, res) => {
    res.render("admin.njk");
  });
  app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("login.njk");
  });
  app.get("/register", (req, res) => {
    res.render("index.html");
  });
  app.get("/setting", auth, (req, res) => {
    // Check db width username in the session.
    console.log(req.session);
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
