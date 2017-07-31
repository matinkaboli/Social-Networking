const express = require("express");
const nunjucks = require("nunjucks");
const bodyParser = require("body-parser");
const session = require("express-session");

const db = require("./db");
const configs = require("./configure");
const posts = require("./apppost");
const gets = require("./appget");
const token = require("./token");

const app = express();

configs(app, express, session, bodyParser, nunjucks);

gets(app, db);

posts(app, session, db.checkUserAndEmail, db.ckeckUserAndPassword, db.User);

token(app, db);

app.use((req, res, next) => {
  res.status(404).render("notfound.njk", {
    url: req.originalUrl
  });
});

app.listen(8080, () => {
  console.log("The server is running on port 8080");
});
