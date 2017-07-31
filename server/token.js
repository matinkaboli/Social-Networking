function token(app, db) {
  app.get("/users/:token", (req, res) => {
    let emailcheck = req.params.token;
    console.log(emailcheck);
    db.checkEmail(emailcheck)
      .then(() => {
        res.send("Email verified. go to <a href='/login'>Login</a>");
      })
      .catch(e => {
        res.send("Dont have such token.");
      });
  });
}

module.exports = token;
