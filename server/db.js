// Main module
const mongoose = require("mongoose");
// Connect to mongodb
mongoose.connect("mongodb://localhost/test", {
  useMongoClient: true
});

let db = mongoose.connection;
let Schema = mongoose.Schema;
// If error happened
db.on("error", console.error.bind(console, "Connection failed."));
// Create schema for followers (including time and username)
const followSchema = new Schema({
  usern: String,
  time: String
});
// Create schema for every post that user create
const postSchema = new Schema({
  title: String,
  address: String,
  time: String
});
// Create schema for user
const userSchema = new Schema({
  name: String,
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: { type: String, required: true },
  email: { type: String, required: true, trim: true },
  emailurl: { type: String },
  created: Date,
  showEmail: { type: Boolean },
  description: {
    about: { type: String, trim: true },
    address: { type: String, trim: true },
    link: { type: String, trim: true },
    sex: { type: Boolean },
    avatar: { type: String },
    case: { type: Boolean }
  },
  follower: [followSchema],
  following: [String],
  posts: [postSchema],
  admin: { type: Boolean }
});
// Before saving
userSchema.pre("save", next => {
  let currentDate = new Date();

  if (!this.created) {
    this.created = currentDate;
  }
  next();
});

const User = mongoose.model("User", userSchema);
// Check username and email in DB (using promise)
function checkUserAndEmail(username, email) {
  return new Promise((resolve, reject) => {
    User.find({ $or: [{ username }, { email }] }, (err, result) => {
      if (JSON.stringify(result) == "[]") resolve("Username is free.");
      else reject("Username or email exists.");
    });
  });
}
// Check username and password in DB
function ckeckUserAndPassword(username, password) {
  return new Promise((resolve, reject) => {
    User.find({ $and: [{ username }, { password }] }, (err, result) => {
      if (JSON.stringify(result) == "[]") reject("Damn it...");
      else resolve(result);
    });
  });
}
// Check token
function checkToken(url) {
  return new Promise((resolve, reject) => {
    User.find({ emailurl: url }, (err, result) => {
      if (JSON.stringify(result) == "[]") reject("404 not found.");
      else {
        User.update({ emailurl: url }, { emailurl: "ok" }, (err, aff) => {
          if (err) throw err;
          resolve("ok");
        });
      }
    });
  });
}
function checkUsername(username) {
  return new Promise((resolve, reject) => {
    User.find({ username }, (err, result) => {
      if (err) throw err;
      if (JSON.stringify(result) == "[]") reject(username);
      else resolve(result);
    })
  })
}

module.exports = {
  User,
  checkUserAndEmail,
  ckeckUserAndPassword,
  checkToken,
  checkUsername
};
