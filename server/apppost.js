const nodemailer = require("nodemailer");
const stringing = require("stringing");
const crypto = require("crypto");
const mail = require("./mail");
const enc = require("./enc");

function posts(app, session, checkUserAndEmail, ckeckUserAndPassword, User) {
  app.post("/", (req, res) => {
    let username = req.body.username.toLowerCase();
    let email = req.body.email.toLowerCase();
    let uniqueLink = stringing.unique(40);
    const user = new User({
      name: req.body.name,
      password: enc.encrypt(crypto, req.body.password),
      emailurl: uniqueLink,
      username,
      email
    });
    checkUserAndEmail(req.body.username, req.body.email)
      .then(answer => {
        user.save(err => {
          if (err) throw err;
          console.log("User saved successfully.");
          res.render("admin.njk", {
            name: req.body.name,
            username: req.body.username,
            email: req.body.email
          });
        });
        req.session.user = req.body.username;
        req.session.pass = enc.encrypt(crypto, req.body.password);
        // make it HTML
        const textmsg = `<a href="localhost:8080/users/${uniqueLink}">Verify</a>`;
        mail(nodemailer, email, textmsg);
      })
      .catch(e => {
        res.render("failedregister.njk", {
          username: user.username,
          email: user.email
        });
      });
  });
  app.post("/checkuser", (req, res) => {
    checkUserAndEmail(req.body.username, req.body.email)
      .then(answer => {
        req.body.ok = true;
        res.json(req.body);
      })
      .catch(e => {
        req.body.ok = false;
        res.json(req.body);
      })
  });
  app.post("/checkemail", (req, res) => {
    checkUserAndEmail(req.body.username, req.body.email)
      .then(answer => {
        req.body.ok = true;
        res.json(req.body);
      })
      .catch(e => {
        req.body.ok = false;
        res.json(req.body);
      })
  });
  app.post("/login", (req, res) => {
    ckeckUserAndPassword(req.body.username, enc.encrypt(crypto, req.body.password))
      .then(answer => {
        res.render("admin.njk", {
          data: answer[0]
        });
        req.session.user = req.body.username;
        req.session.pass = enc.encrypt(crypto, req.body.password);
      })
      .catch(e => {
        res.render("login.njk");
      });
  });
  app.post("/setting", (req, res) => {
    const condition = { username: req.session.user };
    const sex = req.body.sex == "male" ? true : false;
    const update = {
      name: req.body.name,
      username: req.body.username,
      password: enc.encrypt(crypto, req.body.password),
      email: req.body.email,
      description: {
        about: req.body.about,
        address: req.body.address,
        link: req.body.link,
        sex
      }
    };
    User.update(condition, update, (err, numAffected) => {
      console.log(numAffected);
    });
    res.render("admin.njk");
  });
  app.post("/changepass", (req, res) => {
    const condition = {
      password: enc.encrypt(crypto, req.body.oldpassword),
      username: req.session.user
    };
    const update = {
      password: enc.encrypt(crypto, req.body.newpassword)
    };
    User.update(condition, update, (err, numAffected) => {
      console.log(numAffected);
      res.render("admin.njk");
    });
  });
}

module.exports = posts;
