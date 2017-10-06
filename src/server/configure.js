const bodyParser = require("body-parser");

const configs = (app, express, session) => {
  app.use(require('compression')());
  app.use(require("serve-favicon")("maindir/fb.ico"));
  app.use(require("helmet")());
  // Add static files
  app.use(express.static("public"));
  app.use(bodyParser.urlencoded({ extended: false, limit: 500 }));
  app.use(bodyParser.json({ limit: 500 }));
  // Configure template engine
  require("nunjucks").configure("views", {
    autospace: true,
    express: app
  });
  // Configure session
  const MongoStore = require("connect-mongo")(session);
  const configSession = {
    secret: "m@tinnim@125session",
    cookie: {
      maxAge: 7 * 24 * 3600 * 1000,
      httpOnly: true
    },
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      host: "127.0.0.1",
      port: "27017",
      url: "mongodb://localpath/session"
    })
  };
  app.use(session(configSession));
  app.use(require("connect-flash")());
};

module.exports = configs;
