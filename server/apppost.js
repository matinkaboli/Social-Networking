// mail modules
const nodemailer = require("nodemailer");
const stringing = require("stringing");
const crypto = require("crypto");
const sharp = require("sharp");
// import files
const mail = require("./mail");
const enc = require("./enc");
const removeFile = require("./fs");

function posts(
  app,
  session,
  multer,
  imageSize,
  db,
  checkUserAndEmail,
  ckeckUserAndPassword,
  User
) {
  const multerConfig = multer({
    dest: "public/profile/"
  });
  // After register =
  app.post("/", (req, res) => {
    // Make username and email lowercase
    let username = req.body.username.toLowerCase();
    let email = req.body.email.toLowerCase();
    // Create a random link (token)
    let uniqueLink = stringing.unique(40);
    // Set fields to User object
    let defaultPhoto = "../public/default/man.jpg";

    let validShow;
    if (req.body.showemail) {
      validShow = true;
    } else {
      validShow = false;
    }
    const user = new User({
      name: req.body.name,
      // Encrypt Password
      password: enc.encrypt(crypto, req.body.password),
      // Set random link to emailurl
      emailurl: uniqueLink,
      username,
      email,
      showEmail: validShow
    });
    // Check if username or email taken by someone else
    checkUserAndEmail(req.body.username, req.body.email)
      .then(answer => {
        // Save user to the session for 7 days.
        req.session.user = req.body.username.toLowerCase();
        req.session.pass = enc.encrypt(crypto, req.body.password);
        req.session.id = answer[0]._id;
        // Save object
        user.save(err => {
          if (err) throw err;
          res.render("admin.njk");
        });
        // Send email for complete the register
        // mail(nodemailer, email, uniqueLink);
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
        // Save user to the sessino for 7 days
        req.session.user = req.body.username.toLowerCase();
        req.session.pass = enc.encrypt(crypto, req.body.password);
        req.session.id = answer[0]._id;
        res.redirect("/admin");
      })
      .catch(e => {
        res.render("login.njk");
      });
  });
  app.post("/setting", multerConfig.single("avatar"), (req, res) => {
    // Find it in DB
    const condition = {
      username: req.session.user.toLowerCase(),
      password: req.session.pass
    };
    // Change it
    const update = {
      name: req.body.name,
      username: req.body.username.toLowerCase(),
      email: req.body.email.toLowerCase(),
      description: {
        about: req.body.about,
        address: req.body.address,
        link: req.body.link
      }
    };
    // Check select input
    if (req.body.sex === "male") {
      update.description.sex = true;
    } else if (req.body.sex === "female") {
      update.description.sex = false;
    }
    // Check select input
    if (req.body.case === "married") {
      update.description.case = true;
    } else if (req.body.case === "single") {
      update.description.case = false;
    }
    if (req.body.showemail) {
      update.showEmail = true;
    } else {
      update.showEmail = false;
    }
    // Check If user changed his avatar
    User.find(condition, (err, result) => {
      if (err) throw err;
      if (!req.file) {
        if (result[0].description.avatar) {
          update.description.avatar = result[0].description.avatar;
        }
      } else {
        let file = req.file.filename;
        update.description.avatar = req.file.filename + "a";
        imageSize(sharp, file);
      }
    });
    // Set in DB
    setTimeout(() => {
      User.update(condition, update, (err, numAffected) => {
        // Bring user to Admin page after updating setting
        res.redirect("/admin");
      });
    }, 200);
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
      // bring user to Admin page after updating setting
      res.render("admin.njk");
    });
  });
  // Remove session and direct to Login page
  app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });
  app.post("/follow", (req, res) => {
    const watcherObj = {
      username: req.body.watcher.toLowerCase()
    };
    const UTFObj = {
      username: req.body.userToFollow.toLowerCase()
    };
    const userSch = {
      usern: req.body.watcher.toLowerCase(),
      time: Date()
    };
    User.find(watcherObj, (err, tank) => {
      if (err) throw err;
      tank[0].following.push(req.body.userToFollow.toLowerCase());
      tank[0].save((err, updatedTank) => {
        if (err) throw err;
        req.body.fo = "followed";
        res.json(req.body);
      });
    });
    User.find(UTFObj, (err, tank) => {
      if (err) throw err;
      tank[0].follower.push(userSch);
      tank[0].save((err, updatedTank) => {
        if (err) throw err;
      });
    });
  });
  app.post("/unfollow", (req, res) => {
    const condition = {
      username: req.body.watcher.toLowerCase()
    };
    const UTF = req.body.userToFollow.toLowerCase();
    const Watcher = req.body.watcher.toLowerCase();
    User.find(condition, (err, tank) => {
      if (err) throw err;
      let f = tank[0].following;
      let index = f.indexOf(UTF);
      f.splice(index, 1);
      tank[0].save((err, updatedTank) => {
        if (err) throw err;
        req.body.fo = "unfollowed";
        res.json(req.body);
      });
    });
    User.find(
      { username: UTF },
      (err, tank) => {
        if (err) throw err;
        function findFollower(element) {
          return element.usern === Watcher;
        }
        let f = tank[0].follower;
        let index = f.findIndex(findFollower);
        f.splice(index, 1);
        tank[0].save((err, updatedTank) => {
          if (err) throw err;
        });
      }
    );
  });
  app.post("/delete", (req, res) => {
    const condition = { username: req.session.user.toLowerCase() };
    User.find(condition, (err, result) => {
      if (result[0].description.avatar) {
        const address =
          "/home/matin/Documents/projects/facebook/public/profile/";
        removeFile(address + result[0].description.avatar);
      }
      User.find(condition).remove((err, aff) => {
        if (err) throw err;
        req.session.destroy();
        res.redirect("/");
      });
    });
  });
}

module.exports = posts;
