function token(app, db) {
  // Get the token
  app.get("/token/:token", (req, res) => {
    let emailcheck = req.params.token;
    db
      .checkToken(emailcheck)
        // If token was right
        .then(() => {
          res.send("Email verified. go to <a href='/login'>Login</a>");
        })
        // If it wasen't
        .catch(e => {
          res.send("Dont have such token.");
        });
  });
}

module.exports = token;
