// Main modules
const express = require("express");
const session = require("express-session");
// Import files
const db = require("./db");
const configs = require("./configure");
const posts = require("./apppost");
const gets = require("./appget");
const token = require("./token");
// Start
const app = express();
// Express configuration
configs(app, express, session);
// GET Routing
gets(app, db);
// POST routing
posts(app, session, db);
// Check token for account validation
token(app, db);
// 404 status
app.use((req, res, next) => {
  res.status(404).render("notfound.njk", {
    url: req.originalUrl
  });
});
// Listen to 80 port
app.listen(3000, () => {
  console.log("The server is running now.");
});
