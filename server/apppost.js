// main modules
const nodemailer = require("nodemailer");
const stringing = require("stringing");
const crypto = require("crypto");
const sharp = require("sharp");
// import files
const mail = require("./mail");
const enc = require("./enc");
const removeFile = require("./fs");
const msg = require("./msg");
const sendPost = require("./posts");
const removeUserData = require("./removeuserdata");

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
    // Show email on user page
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
    // The user who is going to follow SB:
    const watcherObj = {
      username: req.body.watcher.toLowerCase()
    };
    // The user who is going to be followed.
    const UTFObj = {
      username: req.body.userToFollow.toLowerCase()
    };
    // The object for save in DB
    const userSch = {
      usern: req.body.watcher.toLowerCase(),
      time: Date()
    };
    // Save in DB
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
    // User who is going to be unfollowd
    const UTF = req.body.userToFollow.toLowerCase();
    // User who is going to unfollow SB
    const Watcher = req.body.watcher.toLowerCase();
    User.find(condition, (err, tank) => {
      if (err) throw err;
      // Find it in DB and then remove it
      let f = tank[0].following;
      let index = f.indexOf(UTF);
      f.splice(index, 1);
      tank[0].save((err, updatedTank) => {
        if (err) throw err;
        req.body.fo = "unfollowed";
        res.json(req.body);
      });
    });
    User.find({ username: UTF }, (err, tank) => {
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
    });
  });
  app.post("/delete", (req, res) => {
    // Find user
    const condition = { username: req.session.user.toLowerCase() };
    User.find(condition, (err, result) => {
      // Find his avatar (it he has one)
      if (result[0].description.avatar) {
        const address =
          "/home/matin/Documents/projects/facebook/public/profile/";
          // Remove that file!
        removeFile(address + result[0].description.avatar);
      }
      // Remove his posts in userpost
      removeUserData(result[0].username);
      // Remove him on list of his followings' followers :|
      if (result[0].following.length > 0) {
        for (let i = 0; i < result[0].following.length; i++) {
          User.find({ username: result[0].following[i] }, (err, tank) => {
            if (err) throw err;
            function findFollower(element) {
              return element.usern === result[0].username;
            }
            let f = tank[0].follower;
            let index = f.findIndex(findFollower);
            f.splice(index, 1);
            tank[0].save((err, updatedTank) => {
              if (err) throw err;
            });
          });
        }
      }
      // Remove him from followers
      if (result[0].follower.length > 0) {
        for (let i = 0; i < result[0].follower.length; i++) {
          User.find({ username: result[0].follower[i] }, (err, tank) => {
            let f = tank[0].following;
            let ind = f.indexOf(result[0].username);
            f.splice(ind, 1);
            tank[0].save((err, updatedTank) => {
              if (err) throw err;
            });
          });
        }  
      }
      // Remove the user
      User.find(condition).remove((err, aff) => {
        if (err) throw err;
        req.session.destroy();
        res.redirect("/");
      });
    });
  });
  app.post("/contact", (req, res) => {
    const post = req.body;
    // Save message in messages directory
    msg(post.name, post.email, post.content);
    // Send something in to the client
    res.json({ ok: true });
  });
  app.post("/sendpost", (req, res) => {
    // Create a uniqu e link for the post
    const gen = stringing.unique(30);
    // Find the user who is going to create a post
    const user = req.body.username.toLowerCase();
    // Save post in userpost directory
    sendPost(user, req.body.content, gen);
    // Send something in to the client
    res.json(req.body);
    // Save the post link, title and the date of that in the DB
    User.find({ username: user }, (err, tank) => {
      if (err) throw err;
      const userSch = {
        title: req.body.title,
        address: gen,
        time: Date()
      };
      tank[0].posts.push(userSch);
      tank[0].save((err, updatedTank) => {
        if (err) throw err;
      });
    });
  });
  app.post("/allposts", (req, res) => {
    User.find({ username: req.body.username.toLowerCase() }, (err, result) => {
      /* if (result[0].posts == true) {

        const postResult = result[0].posts;

        if (JSON.stringify(postResult) === "[]") {
          res.json({ ok: false });

        } else {
          const obj = {
            ok: true,
            len: postResult.length,
            posts: postResult
          };
          res.json(obj);
        }
      } */
    });
  });
}

module.exports = posts;
