const fs = require("fs");
const shit = require("./db");
const Sharp = require("sharp");

/*shit.User.find({  }, (err, aff) => {
  if (err) throw err;
  console.log(aff)
});*/

shit.User.find({  }).remove((err, aff) => {
  if (err) throw err;
  console.log(aff)
});
