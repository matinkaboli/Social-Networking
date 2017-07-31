// mail modules
const nodemailer = require("nodemailer");
const stringing = require("stringing");
const crypto = require("crypto");
// import files
const mail = require("./mail");
const enc = require("./enc");

function posts(app, session, checkUserAndEmail, ckeckUserAndPassword, User) {
  // After register =
  app.post("/", (req, res) => {
    // Make username and email lowercase
    let username = req.body.username.toLowerCase();
    let email = req.body.email.toLowerCase();
    // Create a random link (token)
    let uniqueLink = stringing.unique(40);
    // Set fields to User object
    const user = new User({
      name: req.body.name,
      // Encrypt Password
      password: enc.encrypt(crypto, req.body.password),
      // Set random link to emailurl
      emailurl: uniqueLink,
      username,
      email
    });
    // Check if username or email taken by someone else
    checkUserAndEmail(req.body.username, req.body.email)
      .then(answer => {
        // Save object
        user.save(err => {
          if (err) throw err;
          res.render("admin.njk", {
            name: req.body.name,
            username: req.body.username,
            email: req.body.email
          });
        });
        // Save user to the session for 7 days.
        req.session.user = req.body.username;
        req.session.pass = enc.encrypt(crypto, req.body.password);
        // Send email for complete the register
        mail(nodemailer, email, uniqueLink);
      })
      .catch(e => {
        res.render("failedregister.njk", {
          username: user.username,
          email: user.email
        });
      });
  });
  // Check username using fetch in script/register.js
  app.post("/checkuser", (req, res) => {
    checkUserAndEmail(req.body.username, req.body.email)
      .then(answer => {
        // Send true to the client
        req.body.ok = true;
        res.json(req.body);
      })
      .catch(e => {
        // Send false to the client
        req.body.ok = false;
        res.json(req.body);
      });
  });
  // Check email using fetch in script/register.js
  app.post("/checkemail", (req, res) => {
    checkUserAndEmail(req.body.username, req.body.email)
      .then(answer => {
        // Send true to the client
        req.body.ok = true;
        res.json(req.body);
      })
      .catch(e => {
        // Send false to the client
        req.body.ok = false;
        res.json(req.body);
      });
  });
  app.post("/login", (req, res) => {
    // Always make it lowercase ..
    let user = req.body.username.toLowerCase();
    // Check username and encryped password
    ckeckUserAndPassword(user, enc.encrypt(crypto, req.body.password))
      .then(answer => {
        res.render("admin.njk", {
          // Send the first(only) document on the DB
          data: answer[0]
        });
        // Save user to the sessino for 7 days
        req.session.user = req.body.username;
        req.session.pass = enc.encrypt(crypto, req.body.password);
      })
      .catch(e => {
        res.render("login.njk");
      });
  });
  app.post("/setting", (req, res) => {
    // Find it in DB
    const condition = {
      username: req.session.user,
      password: req.session.pass
    };
    // Change it
    const update = {
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      description: {
        about: req.body.about,
        address: req.body.address,
        link: req.body.link,
      }
    };
    // Check radio input
    if (req.body.sex === "male") {
      update.description.sex = true;
    } else if (req.body.sex === "female") {
      update.description.sex = false;
    }
    // Set in DB
    User.update(condition, update, (err, numAffected) => {
      console.log(numAffected);
    });
    // Bring user to Admin page after updating setting
    res.render("admin.njk");
  });
  // Change password in Setting page
  app.post("/changepass", (req, res) => {
    // Find it to the DB
    const condition = {
      password: enc.encrypt(crypto, req.body.oldpassword),
      username: req.session.user
    };
    // Change it
    const update = {
      password: enc.encrypt(crypto, req.body.newpassword)
    };
    // Set in DB
    User.update(condition, update, (err, numAffected) => {
      console.log(numAffected);
      // bring user to Admin page after updating setting
      res.render("admin.njk");
    });
  });
}

module.exports = posts;
