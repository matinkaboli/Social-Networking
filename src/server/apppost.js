// main modules
const stringing = require("stringing");
const multer = require("multer");
const moment = require("moment");
// import files
const imageSize  = require("./imagesize");
const mail       = require("./mail");
const enc        = require("./enc");
const removeFile = require("./fs");
const msg        = require("./msg");
const savePost   = require("./posts");
const showData   = require("./showdata");
const { removeUserData }   = require("./removeuserdata");
const { removeOldImage }   = require("./removeuserdata");
const { removeFollowings } = require("./removefollow");
const { removeFollowers }  =  require("./removefollow");

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
function validateUsername(username) {
  const re = /^[a-zA-Z0-9]+([_ .]?[a-zA-Z0-9])*$/;
  return re.test(username);
}
function validatePassword(password) {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
  return re.test(password);
}

const posts = (app, session, db) => {
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
      res.redirect("/");
      /*res.render("index.njk", {
        status: 7
      });*/
    } else {
      if (req.body.captcha === req.session.captcha) {
        if (
          validateEmail(email) &&
          validateUsername(username) &&
          validatePassword(password)
        ) {
          req.session.captcha = null;
          const user = new db.User({
            password: enc.encrypt(password),
            // Set random link to emailurl
            emailurl: uniqueLink,
            showEmail: validShow,
            username,
            email,
            name,
            likes: 0,
            created: Date.now()
          });
          // Check if username or email taken by someone else
          db.checkUserAndEmail(username, email)
            .then(answer => {
              // Save user to the session for 7 days.
              req.session.user = username;
              // Save object
              user.save()
                .then(() => {
                  res.render("admin.njk", {
                    data: {
                      username,
                      name
                    }
                  });
                })
                .catch(e => {
                  console.error(e);
                });
              // Send email for complete the register
              mail(email, uniqueLink, 0);
            })
            .catch(e => {
              res.redirect("/");
              /*res.render("index.njk", {
                username,
                email,
                status: 1
              });*/
          });
        } else {
          res.redirect("/");
        }
      } else {
        res.redirect("/");
      }
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
    const email = req.body.email.toLowerCase();

    db.checkEmail(email)
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
    db.ckeckUserAndPassword(username, enc.encrypt(req.body.password))
      .then(answer => {
        // Save user to the sessino for 7 days
        req.session.user = username;
        res.redirect("/you");
      })
      .catch(e => {
        res.redirect("/");
        /*res.render("index.njk", {
          status: 3
        });*/
      });
  });
  app.post("/setting", multerConfig.single("avatar"), (req, res) => {
    // Find it in DB
    const userSession = req.session.user.toLowerCase();
    const username = req.body.username.toLowerCase();
    const email = req.body.email.toLowerCase();
    // Change it
    const update = { description: {} };

    if (req.body.name) { update.name = req.body.name; }
    if (req.body.about) { update.description.about = req.body.about; }
    if (req.body.address) { update.description.address = req.body.address;}
    if (req.body.link) { update.description.link = req.body.link; }
    // Check select input
    if (req.body.sex === "male") { update.description.sex = true;
    }else if (req.body.sex === "female") { update.description.sex = false;}
    // Check select input
    if (req.body.case === "married") {
      update.description.case = true;
    } else if (req.body.case === "single") {
      update.description.case = false;
    }
    if (req.body.showemail) { update.showEmail = true;
    } else { update.showEmail = false; }

    const works = async () => {
      const CU = db.checkUsername(username)
        .catch(e => {
          if (username !== "") {
            if (validateUsername(username)) {
              update.username = username;
              req.session.user = username;
            }
          }
        });
      const UE = db.checkBy("email", email)
        .catch(e => {
          if (email !== "") {
            if (validateEmail(email)) {
              update.email = email;
            }
          }
        });
      const changeIMG = db.checkUsername(userSession)
        .then(result => {
          // Check If user changed his avatar
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
        })
        .catch(e => {
          console.error(e);
        });
      const CHECKUSERNAME = await CU;
      CHECKUSERNAME;
      const CHECKEMAIL = await UE;
      CHECKEMAIL;
      const CHECKIMAGE = await changeIMG;
      CHECKIMAGE;
      // Set in DB
      db.User.update(
        { "username": userSession },
        update,
        (err, numAffected) => {
        // Bring user to Admin page after updating setting
        res.redirect("/you");
      });
    };
    works();
  });
  // Change password in Setting page
  app.post("/changepass", (req, res) => {
    // Find it to the DB
    const condition = {
      password: enc.encrypt(req.body.oldpassword),
      username: req.session.user.toLowerCase()
    };
    // Change it
    const update = {};
    if (req.body.newpassword === req.body.repassword) {
      if (validatePassword(req.body.newpassword)) {
        update.password = enc.encrypt(req.body.newpassword);
      }
    }
    // Set in DB
    db.User.update(condition, update, (err, numAffected) => {
      // bring user to Admin page after updating setting
      if (numAffected.nModified == 1) {
        res.redirect("you");
      } else {
        console.error("Did not save.");
        res.redirect("you");
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

    const works = async () => {
      const CU = db.checkUsername(req.session.user.toLowerCase())
        .then(answer => {
          watcherID = answer[0]._id;
        })
        .catch(e => {
          console.error(e);
        });
      const CC = db.checkUsername(UTF)
        .then(answer => {
          UTFID = answer[0]._id;
        })
        .catch(e => {
          console.error(e);
        });
      const CHECKUSERNAME1 = await CU;
      CHECKUSERNAME1;
      const CHECKUSERNAME2 = await CC;
      CHECKUSERNAME2;
      // Save in DB
      db.User.find({ username: UTF }, (err, tank) => {
        if (err) throw err;

        const f = tank[0].follower;
        const index = f.indexOf(watcherID);
        if (index == -1) {
          if (req.session.user.toLowerCase() !== UTF) {

            tank[0].follower.push(watcherID);
            tank[0].save((err, updatedTank) => {
              if (err) throw err;
              db.User.find(
                { username: req.session.user.toLowerCase() },
                (err, tonk) => {
                if (err) throw err;
                tonk[0].following.push(UTFID);
                tonk[0].save((err, updatedTank) => {
                  req.body.fo = "followed";
                  res.json(req.body);
                  if (err) throw err;
                });
              });
            });
          }
        } else {
          req.body.fo = "followed";
          res.json(req.body);
        }
      });
    }
    works();
  });
  app.post("/unfollow", (req, res) => {
    const wholeLink = req.headers.referer.split('/');
    const UTF = wholeLink[wholeLink.length - 1].toLowerCase();

    let watcherID, UTFID;

    const works = async () => {
      const CU = db.checkUsername(req.session.user.toLowerCase())
        .then(answer => {
          watcherID = answer[0]._id;
        })
        .catch(e => {
          console.error(e);
        });
      const CC = db.checkUsername(UTF)
        .then(answer => {
          UTFID = answer[0]._id;
        })
        .catch(e => {
          console.error(e);
        });
      const CHECKUSERNAME1 = await CU;
      CHECKUSERNAME1;
      const CHECKUSERNAME2 = await CC;
      CHECKUSERNAME2;
      db.User.find({ username: UTF }, (err, tank) => {
        if (err) throw err;
        const f = tank[0].follower;
        const index = f.indexOf(watcherID);
        f.splice(index, 1);
        tank[0].save((err, updatedTank) => {
          if (err) throw err;
        });
      });
      db.User.find(
        { username: req.session.user.toLowerCase() },
        (err, tank) => {
        if (err) throw err;
        // Find it in DB and then remove it
        const f = tank[0].following;
        const index = f.indexOf(UTFID);
        f.splice(index, 1);
        tank[0].save((err, updatedTank) => {
          if (err) throw err;
          req.body.fo = "unfollowed";
          res.json(req.body);
        });
      });
    }
    works();
  });
  app.post("/delete", (req, res) => {
    // Find user
    const condition = { username: req.session.user.toLowerCase() };
    db.User.find(condition, (err, result) => {
      // Find his avatar (it he has one)
      if (result[0].description.avatar) {
        const address =
          "BUILDDIRECTORY/public/profile/";
          // Remove that file!
        removeFile(address + result[0].description.avatar);
      }
      // Remove his posts in userpost
      removeUserData(result[0]._id);
      // Remove him on list of his followings' followers :|
      removeFollowings(result[0], db.User);
      // Remove him from followers
      removeFollowers(result[0], db.User);
      // Remove the user
      db.User.find(condition).remove((err, aff) => {
        if (err) throw err;
        req.session.destroy();
        res.redirect("/");
        /*res.render("index.njk", {
          status: 2
        });*/
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
      // Send something in to the client
      // Save the post link, title and the date of that in the DB
      db.User.find({ username }, (err, tank) => {
        if (err) throw err;
        // Save post in userpost directory
        savePost(tank[0]._id, content, link);
        const p = new db.Post({
          _id: link,
          time: now,
          user: tank[0]._id,
          title
        });
        p.save()
          .then(() => {
            res.json(req.body);
          });
      });
    }
  });
  app.post("/allposts", (req, res) => {
    db.User.find(
      { username: req.body.username.toLowerCase() },
      (err, result) => {
        db.Post.find({ user: result[0]._id }, (err, tank) => {
          if (tank.length === 0) {
            res.json({ ok: false });
          } else {
            const obj = {
              ok: true,
              len: tank.length,
              posts: tank
            };
            res.json(obj);
          }
        });
    });
  });
  app.post("/deleteavatar", (req, res) => {
    const condition = {
      username: req.session.user.toLowerCase()
    };
    const query = db.User.find(condition);
    query.then(doc => {
      const address =
        "BUILDDIRECTORY/public/profile/";
        // Remove that file!
      removeFile(address + doc[0].description.avatar);
      doc[0].description.avatar = undefined;
      doc[0].save()
        .then(() => {
          res.redirect("/you");
        })
        .catch(e => {
          console.error(e);
        })
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
          db.User.find({ _id }).then(doc => {
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
    const iter = getData();

    (function loop() {
      const next = iter.next();

      if (next.done) {
        res.json(list);
        return;
      }
      next.value.then(loop);
    }());
  });
  app.post("/forgot", (req, res) => {
    const username = req.body.username.toLowerCase();
    db.User.find({ username }, (err, result) => {
      if (JSON.stringify(result) == "[]") {
        res.redirect("/");
        /*res.render("index.njk", {
          status: 3
        });*/
      } else {
        const unique = stringing.unique(40) + '0' + result[0].username;
        mail(result[0].email, unique, 1);
        result[0].forgot = unique;
        result[0].save((err, updated) => {
          res.redirect("/");
          /*res.render("index.njk", {
            status: 4
          });*/
        });
      }
    });
  });
  app.post("/forgotchange", (req, res) => {
    const pass = req.body.pass;
    const repass = req.body.repass;
    if (pass === repass) {
      if (pass.length < 9) {
        res.render("/");
        /*res.render("index.njk", {
          status: 6
        });*/
      } else {
        const enq = req.body.unq;
        const enqSp = enq.split('0');
        const username = enqSp[enqSp.length - 1];
        db.User.find({ username }, (err, result) => {
          if (JSON.stringify(result) == "[]") {
            res.redirect("/");
            /*res.render("index.njk", {
              status: 7
            });*/
          } else {
            if (result[0].forgot === enq) {
              const p = enc.encrypt(pass);
              result[0].password = p;
              result[0].forgot = null;
              result[0].save((err, updated) => {
                res.redirect("/");
                /*res.render("index.njk", {
                  status: 8
                });*/
              });
            } else {
              res.redirect("/");
              /*res.render("index.njk", {
                status: 7
              });*/
            }
          }
        });
      }
    } else {
      res.redirect("/");
      /*res.render("index.njk", {
        status: 5
      });*/
    }
  });
  app.post("/dislike", (req, res) => {
    const watcher = req.session.user.toLowerCase();
    const user = req.body.username.toLowerCase();
    db.User.find({ username: watcher }, (err, result) => {
      if (JSON.stringify(result) === "[]") {
        res.json({ ok: false });
      } else {
        db.User.find({ username: user }, (err, answer) => {
          if (JSON.stringify(answer) === "[]") {
            res.json({ ok: false });
          } else {
            const watcherID = result[0]._id;
            const userID = answer[0]._id;
            db.Post.find({ _id: req.body._id }, (err, tank) => {
              if (JSON.stringify(tank) == "[]") {
                res.json({ ok: false });
              } else {
                const findWatcher = tank[0].likes.indexOf(watcherID);
                if (findWatcher !== -1) {
                  tank[0].likes.splice(findWatcher, 1);

                  result[0].likes = result[0].likes - 1;
                  result[0].save(err => {
                    if (err) throw err;
                    res.json({ ok: true });
                  });
                  tank[0].save(err => {
                    if (err) throw err;
                  });
                } else {
                  res.json({ ok: false });
                }
              }
            });
          }
        });
      }
    });
  });
  app.post("/like", (req, res) => {
    const watcher = req.session.user.toLowerCase();
    const user = req.body.username.toLowerCase();
    db.User.find({ username: watcher }, (err, result) => {
      if (JSON.stringify(result) === "[]") {
        res.json({ ok: false });
      } else {
        db.User.find({ username: user }, (err, answer) => {
          if (JSON.stringify(answer) === "[]") {
            res.json({ ok: false });
          } else {
            const watcherID = result[0]._id;
            const userID = answer[0]._id;
            db.Post.find({ _id: req.body._id }, (err, tank) => {
              if (JSON.stringify(tank) == "[]") {
                res.json({ ok: false });
              } else {
                const likes = tank[0].likes;
                const userLikeFN = e => e === watcherID;
                const isUserLiked = likes.some(userLikeFN);
                if (!isUserLiked) {
                  tank[0].likes.push(watcherID);
                  result[0].likes = result[0].likes + 1;
                  result[0].save(err => {
                    if (err) throw err;
                    res.json({ ok: true });
                  });
                  tank[0].save(err => {
                    if (err) throw err;
                  });
                } else {
                  res.json({ ok: false });
                }
              }
            });
          }
        });
      }
    });
  });
  app.post("/morepost", (req, res) => {
    const enumerate = req.body.enumerate * 10;
    const user = req.body.username;
    const watcher = req.body.watcher;
    const queryU = db.User.find({ username: user });
    queryU.then(docU => {
      if (JSON.stringify(docU) === "[]") {
        res.json({ ok: false });
      } else {
        const idUser = docU[0]._id;
        const queryP = db.Post.find({ user: idUser })
          .skip(enumerate)
          .limit(10)
          .sort({ time: 1 });
        queryP.then(docP => {
          if (JSON.stringify(docP) === "[]") {
            res.json({ done: true });
          } else {
            const queryW = db.User.find({ username: watcher });
            queryW.then(docW => {
              if (JSON.stringify(docW) === "[]") {
                res.json({ ok: false });
              } else {
                const idWatcher = docW[0]._id;
                const list = [];
                function* getOtherPost() {
                  for (const post of docP) {
                    yield new Promise(resolve => {
                      const dir = "maindir/userpost";
                      showData(`${dir}/${idUser}/${post._id}`)
                        .then(dataPost => {
                          const findA = e => e === idWatcher;
                          const isLiked = post.likes.some(findA);
                          const obj = {
                            time: moment(post.time).fromNow(),
                            title: post.title,
                            content: dataPost,
                            _id: post._id,
                            likes: post.likes,
                          };
                          if (isLiked) {
                            obj.like = true;
                          } else {
                            obj.like = false;
                          }
                          list.push(obj);
                          resolve();
                        })
                        .catch(e => {
                          console.error(e);
                        });
                    });
                  }
                }
                const iter = getOtherPost();
                (function loop() {
                  const next = iter.next();

                  if (next.done) {
                    const leftPost = db.Post.find({ user: idUser })
                      .skip(enumerate + 10)
                      .sort({ time: 1 });

                    leftPost.then(docL => {
                      if (JSON.stringify(docL) === "[]") {
                        res.json({
                          done: true,
                          list
                        });
                      } else {
                        res.json({
                          done: false,
                          list
                        })
                      }
                    });

                    return;
                  }
                  next.value.then(loop);
                }());
              }
            });
          }
        });
      }
    });
  });
};

module.exports = posts;
// priority, compel, bury, coffin, spot, dump, willing
// sire, fleas, dimmer, council, behold, buzz, clue, stake,
// tempt, surreal, bound, flag, muscle, hall, phsyco
