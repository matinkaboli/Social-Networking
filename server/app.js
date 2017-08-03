// Main modules
const express = require("express");
const nunjucks = require("nunjucks");
const bodyParser = require("body-parser");
const session = require("express-session");
const multer = require("multer");
// Import files
const db = require("./db");
const configs = require("./configure");
const posts = require("./apppost");
const gets = require("./appget");
const token = require("./token");
const imageSize = require("./imagesize");
// Start
const app = express();
// Express configuration
configs(app, express, bodyParser, nunjucks, session);
// GET Routing
gets(app, db);
// POST routing
posts(
  app,
  session,
  multer,
  imageSize,
  db.checkUserAndEmail,
  db.ckeckUserAndPassword,
  db.User
);
// Check token for account validation
token(app, db);
// 404 status
app.use((req, res, next) => {
  res.status(404).render("notfound.njk", {
    url: req.originalUrl
  });
});
// Listen to 8080 port
app.listen(81, () => {
  console.log("The server is running on port 81");
});
