// Main module
const mongoose = require("mongoose");
mongoose.Promise = Promise;
const autoInc = require("mongoose-auto-increment");

// Connect to mongodb
const connection = mongoose.connect("mongodb://localpath/test", {
  useMongoClient: true
});

let db = mongoose.connection;
let Schema = mongoose.Schema;

autoInc.initialize(connection);
// If error happened
db.on("error", console.error.bind(console, "Connection failed."));
// Create schema for comments for posts
const commentSchema = new Schema({
  user: Number,
  time: Number,
  text: String
}, { _id: false, versionKey: false });
// Create schema for every post that user create
const postSchema = new Schema({
  _id: String,
  title: String,
  time: Number,
  likes: [Number],
  comments: [commentSchema],
  user: Number
}, { _id: false, versionKey: false });
// What happened lately?
/*const recent = new Schema({
  status: Number,
  name: String,
  time: Number
});*/
// Create schema for user
const userSchema = new Schema({
  _id: Number,
  name: String,
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: { type: String, required: true },
  email: { type: String, required: true, trim: true, unique: true },
  emailurl: { type: String },
  created: Number,
  showEmail: { type: Boolean },
  description: {
    about: { type: String, trim: true },
    address: { type: String, trim: true },
    link: { type: String, trim: true },
    sex: { type: Boolean },
    avatar: { type: String },
    case: { type: Boolean }
  },
  likes: Number,
  follower: [Number],
  following: [Number],
  admin: { type: Boolean },
  forgot: String
}, { versionKey: false });

userSchema.plugin(autoInc.plugin, "User");

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
// Check username and email in DB (using promise)
const checkUserAndEmail = (username, email) => {
  return new Promise((resolve, reject) => {
    User.find({ $or: [{ username }, { email }] }, (err, result) => {
      if (JSON.stringify(result) == "[]") resolve("Username is free.");
      else reject("Username or email exists.");
    });
  });
};
// Check username and password in DB
const ckeckUserAndPassword = (username, password) => {
  return new Promise((resolve, reject) => {
    User.find({ $and: [{ username }, { password }] }, (err, result) => {
      if (JSON.stringify(result) == "[]") reject("Damn it...");
      else resolve(result);
    });
  });
};
// Check token
const checkToken = url => {
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
};
// Does username exist?
const checkUsername = username => {
  return new Promise((resolve, reject) => {
    User.find({ username }, (err, result) => {
      if (err) throw err;
      if (JSON.stringify(result) == "[]") {
        reject(username);
      } else {
        resolve(result);
      }
    });
  });
};
const checkEmail = email => {
  return new Promise((resolve, reject) => {
    User.find({ email }, (err, result) => {
      if (err) throw err;
      if (JSON.stringify(result) == "[]") {
        reject(email);
      } else {
        resolve(result);
      }
    });
  });
};

const checkBy = (key, value) => {
  return new Promise((resolve, reject) => {
    User.find({ key: value }, (err, result) => {
      if (err) throw err;
      if (JSON.stringify(result) == "[]") reject("Not Found.");
      else resolve(result);
    });
  });
};

module.exports = {
  User,
  Post,
  checkUserAndEmail,
  ckeckUserAndPassword,
  checkToken,
  checkUsername,
  checkBy,
  checkEmail
};
