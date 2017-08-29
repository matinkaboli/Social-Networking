const fs = require("fs");
const shit = require("./db");
const Sharp = require("sharp");

shit.User.find({ username: "matinkaboli" }, (err, aff) => {
  if (err) throw err;
  console.log(aff[0])
});

/* shit.User.find({}, null, { sort: { "posts": -1 }}, (err, doc) => {
  console.log(doc);
}) */

/* shit.User.find({  }).remove((err, aff) => {
  if (err) throw err;
  console.log(aff)
}); */
