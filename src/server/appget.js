// Matin modules
const moment = require("moment");
const svgCaptcha = require("svg-captcha");
// Import Files
const showData = require("./showdata");

const gets = (app, db) => {
  // Auth users with session
  const auth = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    } else {
      res.render("index.njk", {
        status: 0
      });
    }
  };
  // Main page
  app.get("/", (req, res) => {
    if (req.session && req.session.user) {
      res.redirect("/you");
    } else {
      const captcha = svgCaptcha.create({ size: 6, noise: 2 });
      req.session.captcha = captcha.text;
      res.render("index.njk", {
        captcha: captcha.data
      });
    }
  });
  // Login page, using session.
  app.get("/login", auth, (req, res) => {
    res.render("admin.njk");
  });
  // Register page, same as main page
  app.get("/register", (req, res) => {
    // Check session
    res.redirect("/");
  });
  // Setting page for complete account options
  app.get("/setting", auth, (req, res) => {
    // Check db width username in the session.
    db.checkUsername(req.session.user.toLowerCase())
      .then(answer => {
        res.render("setting.njk", {
          data: answer[0]
        });
      })
      .catch(e => {
        console.error(e);
        res.send("Error...");
      });
  });
  app.get("/you", auth, (req, res) => {
    if (req.query.q) {
      res.send(req.query.q);
    } else {
      // Find the user
      const condition = {
        username: req.session.user
      };
      db.User.find(condition, (err, answer) => {
        const postAddress = "maindir/userpost/";
        res.render("admin.njk", {
          data: answer[0]
        });
      });
    }
  });
  app.get("/u/:username", (req, res) => {
    if (req.query.tab) {
      const username = req.params.username.toLowerCase();
      db.User.find({ username }, (err, tonk) => {
        if (JSON.stringify(tonk) != "[]") {
          if (req.query.tab == "following") {
            const numPage = parseInt(req.query.page);
            let begin = (numPage * 10) - 10;
            let end = numPage * 10;

            const list = [];
            const lib = [];

            for (; begin < end; begin++) {
              list.push(tonk[0].following[begin]);
            }
            const checkElements = element => element === undefined;
            let some = list.some(checkElements);

            if (list.every(checkElements)) {
              res.render("listuser.njk", {
                status: 1,
                done: true,
                list,
                username,
                numPage
              });
            } else {
              res.render("listuser.njk", {
                status: 1,
                done: false,
                list,
                username,
                numPage,
                some
              });
            }
          } else if (req.query.tab == "follower") {
            const numPage = parseInt(req.query.page);
            let begin = (numPage * 10) - 10;
            let end = numPage * 10;

            const list = [];

            for (; begin < end; begin++) {
              list.push(tonk[0].follower[begin]);
            }
            const checkElements = element => element === undefined;
            let some = list.some(checkElements);
            if (list.every(checkElements)) {
              res.render("listuser.njk", {
                status: 2,
                done: true,
                list,
                username,
                numPage
              });
            } else {
              res.render("listuser.njk", {
                status: 2,
                done: false,
                list,
                username,
                numPage,
                some
              });
            }
          }
        } else {
          res.render("usernotfound.njk", {
            url: username
          });
        }
      });
    } else {
      // User page
      const username = req.params.username.toLowerCase();
      // Find if the user exists
      db.User.find({ username }, (err, result) => {
        if (err) throw err;
        if (JSON.stringify(result) == "[]") {
          // If it doesn't
          res.render("usernotfound.njk", {
            url: username
          });
        } else {
          // If it does, look at the watcher(logged or not)
          if (req.session && req.session.user) {
            const userSes = req.session.user.toLowerCase();

            let isFollowed = result[0].follower;
            // Did you follow him/her ?
            let userSesID, finder;

            db.checkUsername(userSes)
              .then(answer => {
                userSesID = answer[0]._id;
              })
              .then(() => {
                const hasFollowed = username => username === userSesID;
                finder = isFollowed.some(hasFollowed);
                const list = [];
                const query = db.Post.find({
                  user: result[0]._id
                })
                  .limit(10)
                  .sort({ time: 1});

                const pro = query.exec();

                pro.then(firstPosts => {
                function* getData() {
                  for (const post of firstPosts) {
                    yield new Promise(resolve => {
                      const dir =
                      "maindir/userpost/";
                      showData(`${dir}${result[0]._id}/${post._id}`)
                        .then(data => {
                          const findA = el => el === userSesID;
                          const isLiked = post.likes.some(findA);
                          const obj = {
                            time: moment(post.time).fromNow(),
                            title: post.title,
                            content: data,
                            _id: post._id,
                            likes: post.likes,
                            //comments: post.comments,
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
                let iter = getData();
                (function loop() {
                  const next = iter.next();

                  if (next.done) {
                    db.Post.find({
                      user: result[0]._id
                    }, (err, allPosts) => {
                      // If you didn't
                      if (!finder) {
                        res.render("userin.njk", {
                          data: result[0],
                          created: moment(result[0].created).fromNow(),
                          self: req.session.user,
                          isFollowed: false,
                          list,
                          url: username,
                          lenPost: allPosts.length
                        });
                      // If you did
                      } else {
                        res.render("userin.njk", {
                          data: result[0],
                          created: moment(result[0].created).fromNow(),
                          self: req.session.user,
                          isFollowed: true,
                          list,
                          url: username,
                          lenPost: allPosts.length
                        });
                      }
                    });
                    return;
                  }
                  next.value.then(loop);
                }());
                });
              })
              .catch(e => {
                console.error(e);
              });
          } else {
            res.render("userout.njk", {
              created: moment(result[0].created).fromNow(),
              data: result[0]
            });
          }
        }
      });
    }
  });
  app.get("/contact", (req, res) => {
    res.render("contact.njk");
  });
  app.get("/u/:username/s/:address", (req, res) => {
    const us = req.params.username.toLowerCase();
    const ad = req.params.address;
    db.User.find({ username: us }, (err, tank) => {
      if (JSON.stringify(tank) == "[]") {
        res.send("Username Does not exist.");
      } else {
        db.Post.find({ _id: ad }, (err, resultPost) => {
          if (JSON.stringify(resultPost) === "[]") {
            res.send("Not found.");
          } else {
            let userposts =
            "maindir/userpost/";
            userposts += tank[0]._id;
            userposts += '/';
            userposts += resultPost[0]._id;
            showData(userposts)
              .then(result => {
                res.render("userpost.njk", {
                  title: resultPost[0].title,
                  time: moment(resultPost[0].time).fromNow(),
                  username: us,
                  data: result
                });
              })
              .catch(e => {
                res.send("Error happened. Sorry");
              });
          }
        });
      }
    });
  });
  app.get("/forgot", (req, res) => {
    res.render("forgot.njk");
  });
  app.get("/forgotchange/:unique", (req, res) => {
    const forgot = req.params.unique;
    db.User.find({ forgot }, (err, result) => {
      if (JSON.stringify(result) == "[]") {
        res.redirect("/");
      } else {
        const us = forgot.split('0');
        const username = us[us.length - 1];
        res.render("changepass.njk", {
          username,
          unq: forgot
        });
      }
    });
  });
  app.get("/token/:unq", (req, res) => {
    const unq = req.params.unq;
    db.User.find({ emailurl: unq }, (err, result) => {
      if (JSON.stringify(result) === "[]") {
        res.redirect("/");
      } else {
        result[0].emailurl = null;
        result[0].save(err => {
          if (err) throw err;
          res.send("Good");
        });
      }
    });
  });
};

module.exports = gets;
