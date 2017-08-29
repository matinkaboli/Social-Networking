// main modules
const stringing = require("stringing");
// import files
const imageSize  = require("./imagesize");
const mail       = require("./mail");
const enc        = require("./enc");
const removeFile = require("./fs");
const msg        = require("./msg");
const savePost   = require("./posts");
const { removeUserData } = require("./removeuserdata");
const { removeOldImage } = require("./removeuserdata");
const { removeFollowings } = require("./removefollow");
const { removeFollowers } =  require("./removefollow");

function posts(
  app,
  session,
  multer,
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

    const password = req.body.password;
    const name = req.body.name;

    if (!username || !email || !password || !name) {
      res.redirect("index.njk", {
        status: 7
      });
    } else {
      const user = new User({
        // Encrypt Password
        password: enc.encrypt(password),
        // Set random link to emailurl
        emailurl: uniqueLink,
        showEmail: validShow,
        username,
        email,
        name
      });
      // Check if username or email taken by someone else
      checkUserAndEmail(username, email)
        .then(answer => {
          // Save user to the session for 7 days.
          req.session.user = username;
          // Save object
          user.save(err => {
            if (err) throw err;
            res.render("admin.njk", {
              data: {
                username,
                name
              }
            });
          });
          // Send email for complete the register
          // mail(email, uniqueLink);
        })
        .catch(e => {
          res.render("index.njk", {
            username,
            email,
            status: 1
          });
        });
    }
  });
  // Check username using fetch in script/register.js
  app.post("/checkusername", (req, res) => {
    const username = req.body.username.toLowerCase();

    db.checkUsername(username)
      .then(answer => {
        req.body.ok = false;
        res.json(req.body);
      })
      .catch(e => {
        req.body.ok = true;
        res.json(req.body);
      });
  });
  // Check email using fetch in script/register.js
  app.post("/checkemail", (req, res) => {
    const email = req.body.email;
    db.checkBy("email", email)
      .then(answer => {
        req.body.ok = false;
        res.json(req.body);
      })
      .catch(e => {
        req.body.ok = true;
        res.json(req.body);
      });
  });
  app.post("/login", (req, res) => {
    // Always make it lowercase ..
    const username = req.body.username.toLowerCase();
    // Check username and encryped password
    ckeckUserAndPassword(username, enc.encrypt(req.body.password))
      .then(answer => {
        // Save user to the sessino for 7 days
        req.session.user = username;
        res.redirect("/admin");
      })
      .catch(e => {
        res.render("index.njk", {
          status: 3
        });
      });
  });
  app.post("/setting", multerConfig.single("avatar"), (req, res) => {
    // Find it in DB
    const condition = {
      username: req.session.user.toLowerCase()
    };
    const username = req.body.username.toLowerCase();
    const email = req.body.email.toLowerCase();
    // Change it
    const update = {
      description: {}
    };
    db.checkUsername(username)
      .catch(e => {
        update.username = username;
        req.session.user = username;
      });
    db.checkBy("email", email)
      .catch(e => {
        update.email = email;
      });
    if (req.body.name) {
      update.name = req.body.name;
    }
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
        if (result[0].description) {
          if (result[0].description.avatar) {
            update.description.avatar = result[0].description.avatar;
          }
        }
      } else {
        const mime = req.file.mimetype;
        if (mime === "image/jpeg" || mime === "image/png") {
          const file = req.file.filename;
          update.description.avatar = file + 'a';
          imageSize(file);
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
      password: enc.encrypt(req.body.oldpassword),
      username: req.session.user
    };
    // Change it
    const update = {
      password: enc.encrypt(req.body.newpassword)
    };
    // Set in DB
    User.update(condition, update, (err, numAffected) => {
      // bring user to Admin page after updating setting
      if (numAffected.nModified == 1) {
        res.redirect("admin");
      } else {
        res.redirect("admin");
      }
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

    let watcherID, UTFID;
    db.checkUsername(req.session.user)
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
    setTimeout(() => {
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
            User.find({ username: req.session.user }, (err, tonk) => {
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
    }, 200);
  });
  app.post("/unfollow", (req, res) => {
    const wholeLink = req.headers.referer.split('/');

    const UTF = wholeLink[wholeLink.length - 1].toLowerCase();

    let watcherID, UTFID;

    db.checkUsername(req.session.user)
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
    setTimeout(() => {
      User.find({ username: UTF }, (err, tank) => {
        if (err) throw err;
        let f = tank[0].follower;
        let index = f.indexOf(watcherID);
        f.splice(index, 1);
        tank[0].save((err, updatedTank) => {
          if (err) throw err;
        });
      });
      User.find({ username: req.session.user }, (err, tank) => {
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
    }, 200);
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
        res.render("index.njk", {
          status: 2
        });
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
    const content = req.body.content;
    const title = req.body.title;
    if (!username || !content || !title) {
      res.json({ status: 0 });
    } else {

      const link = stringing.unique(40);
      // Save post in userpost directory
      savePost(username, content, link);
      // Send something in to the client
      // Save the post link, title and the date of that in the DB
      User.find({ username }, (err, tank) => {
        if (err) throw err;
        const userSch = {
          _id: link,
          time: now,
          title
        };
        tank[0].posts.push(userSch);
        tank[0].save((err, updatedTank) => {
          if (err) throw err;
          res.json(req.body);
        });
      });
    }
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
  app.post("/forgot", (req, res) => {
    const username = req.body.username.toLowerCase();
    User.find({ username }, (err, result) => {
      if (JSON.stringify(result) == "[]") {
        res.render("index.njk", {
          status: 3
        });
      } else {
        const unique = stringing.unique(40) + '0' + result[0].username;
        mail(result[0].email, unique);
        result[0].forgot = unique;
        result[0].save((err, updated) => {
          res.render("index.njk", {
            status: 4
          });
        });
      }
    });
  });
  app.post("/forgotchange", (req, res) => {
    const pass = req.body.pass;
    const repass = req.body.repass;
    if (pass === repass) {
      if (pass.length < 9) {
        res.render("index.njk", {
          status: 6
        });
      } else {
        const enq = req.body.unq;
        const enqSp = enq.split('0');
        const username = enqSp[enqSp.length - 1];
        User.find({ username }, (err, result) => {
          if (JSON.stringify(result) == "[]") {
            res.render("index.njk", {
              status: 7
            });
          } else {
            if (result[0].forgot === enq) {
              const p = enc.encrypt(pass);
              result[0].password = p;
              result[0].forgot = null;
              result[0].save((err, updated) => {
                res.render("index.njk", {
                  status: 8
                });
              });
            } else {
              res.render("index.njk", {
                status: 7
              });
            }
          }
        });
      }
    } else {
      res.render("index.njk", {
        status: 5
      });
    }
  });
}

module.exports = posts;
// priority, compel, bury, coffin, spot, dump, willing
// sire, fleas, dimmer, council, behold, buzz, clue, stake,
// tempt, surreal, bound, flag, muscle, hall, phsyco
