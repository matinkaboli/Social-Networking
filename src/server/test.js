const shit = require("./db");

/* shit.User.find({  }, (err, aff) => {
  if (err) throw err;
  console.log(aff);
}); */

shit.User.find({ }).remove((err, aff) => {
  if (err) throw err;
  console.log(aff)
});
