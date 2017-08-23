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
const savePost = require("./posts");
const { removeUserData } = require("./removeuserdata");
const { removeFollowings } = require("./removefollow");
const { removeFollowers } = require("./removefollow");
const { removeOldImage } = require("./removeuserdata");
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
    const username = req.body.username.toLowerCase();
    const email = req.body.email.toLowerCase();
    // Create a random link (token)
    const uniqueLink = stringing.unique(40);
    // Set fields to User object
    const defaultPhoto = "../public/default/man.jpg";
    // Show email on user page
    const validShow = req.body.showemail ? true : false;

    const user = new User({
      name: req.body.name,
      // Encrypt Password
      password: enc.encrypt(crypto, req.body.password),
      // Set random link to emailurl
      emailurl: uniqueLink,
      showEmail: validShow,
      username,
      email
    });
    // Check if username or email taken by someone else
    checkUserAndEmail(username, email)
      .then(answer => {
        // Save user to the session for 7 days.
        req.session.user = username;
        req.session.pass = enc.encrypt(crypto, req.body.password);
        // Save object
        user.save(err => {
          if (err) throw err;
          res.render("admin.njk", {
            data: {
              username,
              name: req.body.name
            }
          });
        });
        // Send email for complete the register
        // mail(nodemailer, email, uniqueLink);
      })
      .catch(e => {
        res.render("failedregister.njk", {
          username,
          email
        });
      });
  });
  // Check username using fetch in script/register.js
  app.post("/checkuser", (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    checkUserAndEmail(username, email)
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
    const username = req.body.username;
    const email = req.body.email;
    checkUserAndEmail(username, email)
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
    const username = req.body.username.toLowerCase();
    // Check username and encryped password
    ckeckUserAndPassword(username, enc.encrypt(crypto, req.body.password))
      .then(answer => {
        // Save user to the sessino for 7 days
        req.session.user = username;
        req.session.pass = enc.encrypt(crypto, req.body.password);
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
      description: {}
    };
    if (req.body.about) {
      update.description.about = req.body.about;
    }
    if (req.body.address) {
      update.description.address = req.body.address;
    }
    if (req.body.link) {
      update.description.link = req.body.link;
    }
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
        const mime = req.file.mimetype;
        if (mime === "image/jpeg" || mime === "image/png") {
          const file = req.file.filename;
          update.description.avatar = file + 'a';
          imageSize(sharp, file);
          // Delete the old one.
          if (result[0].description.avatar) {
            removeOldImage(result[0].description.avatar);
          }
        } else {
          // Delete this shit.
          update.description.avatar = result[0].description.avatar;
          removeOldImage(req.file.filename);
        }
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
      res.redirect("admin");
    });
  });
  // Remove session and direct to Login page
  app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });
  app.post("/follow", (req, res) => {
    const wholeLink = req.headers.referer.split('/');

    const UTF = wholeLink[wholeLink.length - 1].toLowerCase();
    const watcher = req.body.watcher.toLowerCase();

    let watcherID, UTFID;
    db.checkUsername(watcher)
      .then(answer => {
        watcherID = answer[0]._id;
      })
      .catch(e => {
        console.error(e);
      });
    db.checkUsername(UTF)
      .then(answer => {
        UTFID = answer[0]._id;
      })
      .catch(e => {
        console.error(e);
      });
    // Save in DB
    User.find({ username: UTF }, (err, tank) => {
      if (err) throw err;

      let f = tank[0].follower;
      let index = f.indexOf(watcherID);
      if (index == -1) {
        tank[0].follower.push(watcherID);
        tank[0].save((err, updatedTank) => {
          if (err) throw err;
          req.body.fo = "followed";
          res.json(req.body);
          User.find({ username: watcher }, (err, tonk) => {
            if (err) throw err;
            tonk[0].following.push(UTFID);
            tonk[0].save((err, updatedTank) => {
              if (err) throw err;
            });
          });
        });
      } else {
        req.body.fo = "followed";
        res.json(req.body);
      }
    });
  });
  app.post("/unfollow", (req, res) => {
    const wholeLink = req.headers.referer.split('/');

    const UTF = wholeLink[wholeLink.length - 1].toLowerCase();
    const Watcher = req.body.watcher.toLowerCase();

    let watcherID, UTFID;

    db.checkUsername(Watcher)
      .then(answer => {
        watcherID = answer[0]._id;
      })
      .catch(e => {
        console.error(e);
      });
    db.checkUsername(UTF)
      .then(answer => {
        UTFID = answer[0]._id;
      })
      .catch(e => {
        console.error(e);
      });
    User.find({ username: UTF }, (err, tank) => {
      if (err) throw err;
      let f = tank[0].follower;
      let index = f.indexOf(watcherID);
      f.splice(index, 1);
      tank[0].save((err, updatedTank) => {
        if (err) throw err;
      });
    });
    User.find({ username: Watcher }, (err, tank) => {
      if (err) throw err;
      // Find it in DB and then remove it
      let f = tank[0].following;
      let index = f.indexOf(UTFID);
      f.splice(index, 1);
      tank[0].save((err, updatedTank) => {
        if (err) throw err;
        req.body.fo = "unfollowed";
        res.json(req.body);
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
      removeFollowings(result[0], User);
      // Remove him from followers
      removeFollowers(result[0], User);
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
    msg(post.name, post.email.toLowerCase(), post.content);
    // Send something in to the client
    res.json({ ok: true });
  });
  app.post("/sendpost", (req, res) => {
    const now = Date.now();
    // Find the user who is going to create a post
    const username = req.body.username.toLowerCase();
    // Save post in userpost directory
    savePost(username, req.body.content, now.toString());
    // Send something in to the client
    // Save the post link, title and the date of that in the DB
    User.find({ username }, (err, tank) => {
      if (err) throw err;
      const userSch = {
        title: req.body.title,
        time: now
      };
      tank[0].posts.push(userSch);
      tank[0].save((err, updatedTank) => {
        if (err) throw err;
        res.json(req.body);
      });
    });
  });
  app.post("/allposts", (req, res) => {
    User.find({ username: req.body.username.toLowerCase() }, (err, result) => {
      if (result[0].posts.length === 0) {
        res.json({ ok: false });
      } else {
        const postResult = result[0].posts;
        const obj = {
          ok: true,
          len: postResult.length,
          posts: postResult
        };
        res.json(obj);
      }
    });
  });
  app.post("/deleteavatar", (req, res) => {
    const condition = {
      username: req.session.user.toLowerCase(),
      password: req.session.pass
    };
    const query = User.find(condition);

    query.then(doc => {
      const address =
        "/home/matin/Documents/projects/facebook/public/profile/";
        // Remove that file!
      removeFile(address + doc[0].description.avatar);
      doc[0].description.avatar = undefined;
      res.redirect("/admin");
      doc[0].save(err => {
        if (err) throw err;
      });
    });
  });
  app.post("/getinfofollow", (req, res) => {
    const sp = new Set(req.body.sp);
    sp.delete('');

    const arr = Array.from(sp);

    for (let i = 0; i < arr.length; i++) {
      arr[i] = parseInt(arr[i]);
    }
    const list = [];
    function* getData() {
      for (const _id of arr) {
        yield new Promise(resolve => {
          User.find({ _id }).then(doc => {
            const obj = {
              avatar: doc[0].description.avatar,
              username: doc[0].username
            }
            list.push(obj);
            resolve();
          });
        });
      }
    }
    let iter = getData();

    (function loop() {
      const next = iter.next();

      if (next.done) {
        res.json(list);
        return;
      }
      next.value.then(loop);
    }());

    // Convert to Number
  });
}

module.exports = posts;
