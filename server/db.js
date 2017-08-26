// Main module
const mongoose = require("mongoose");
mongoose.Promise = Promise;
const autoInc = require("mongoose-auto-increment");

// Connect to mongodb
const connection = mongoose.connect("mongodb://localhost/test", {
  useMongoClient: true
});

let db = mongoose.connection;
let Schema = mongoose.Schema;

autoInc.initialize(connection);
// If error happened
db.on("error", console.error.bind(console, "Connection failed."));

// Create schema for every post that user create
const postSchema = new Schema({
  title: String,
  time: Number
}, { _id: false });
// What happened lately?
/*const recent = new Schema({
  status: Number,
  name: String,
  time: Number
});*/
// Create schema for user
const userSchema = new Schema({
  _id: Number,
  seq: 0,
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
  follower: [Number],
  following: [Number],
  posts: [postSchema],
  admin: { type: Boolean },
  forgot: String
});
// Before saving
userSchema.pre("save", next => {
  let currentDate = new Date();

  if (!this.created) {
    this.created = currentDate;
  }
  next();
});

userSchema.plugin(autoInc.plugin, "User");

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
// Does username exist?
function checkUsername(username) {
  return new Promise((resolve, reject) => {
    User.find({ username }, (err, result) => {
      if (err) throw err;
      if (JSON.stringify(result) == "[]") reject(username);
      else resolve(result);
    });
  });
}

function checkBy(key, value) {
  return new Promise((resolve, reject) => {
    User.find({ key: value }, (err, result) => {
      if (err) throw err;
      if (JSON.stringify(result) == "[]") reject("Not Found.")
      else resolve(result);
    });
  });
}

module.exports = {
  User,
  checkUserAndEmail,
  ckeckUserAndPassword,
  checkToken,
  checkUsername,
  checkBy
};
