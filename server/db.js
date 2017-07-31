const mongoose = require("mongoose");
const crypto = require("crypto");

function decrypt(text) {
  let decipher = crypto.createDecipher("aes-256-ctr", "peshkelmachalaq");
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

mongoose.connect("mongodb://localhost/test", {
  useMongoClient: true
});

let db = mongoose.connection;
let Schema = mongoose.Schema;

db.on("error", console.error.bind(console, "Connection failed."));

const userSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true, minlength: 5, trim: true },
  password: { type: String, required: true },
  email: { type: String, required: true, trim: true },
  emailurl: { type: String },
  created: Date,
  description: {
    about: { type: String, trim: true },
    address: { type: String, trim: true },
    link: { type: String, trim: true },
    sex : { type: Boolean }
  },
  admin: { type: Boolean }
});

userSchema.pre("save", next => {
  let currentDate = new Date();

  if (!this.created) {
    this.created = currentDate;
  }
  next();
});

const User = mongoose.model("User", userSchema);

function checkUserAndEmail(username, email) {
  return new Promise((resolve, reject) => {
    User.find({ $or: [{ username }, { email }]}, (err, result) => {
      if (JSON.stringify(result) == "[]") resolve("Username is free.");
      else reject("Username or email exists.");
    });
  });
}
function ckeckUserAndPassword(username, password) {
  return new Promise((resolve, reject) => {
    User.find({ $and: [{ username }, { password }]}, (err, result) => {
      if (JSON.stringify(result) == "[]") reject("Damn it...");
      else resolve(result);
    });
  });
}
function checkEmail(url) {
  return new Promise((resolve, reject) => {
    User.find({ emailurl: url }, (err, result) => {
      if (JSON.stringify(result) == "[]") reject("404 not found.");
      else {
        User.update({ emailurl: url }, { emailurl: null }, (err, aff) => {
          if (err) throw err;
          resolve("ok");
        });
      }
    });
  });
}
module.exports = {
  User,
  checkUserAndEmail,
  ckeckUserAndPassword,
  checkEmail
};
