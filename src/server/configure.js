const helmet = require("helmet");
const connectMongo = require("connect-mongo");
const nunjucks = require("nunjucks");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const compression = require('compression');
const flash = require("connect-flash");

const configs = (app, express, session) => {
  app.use(compression());
  app.use(favicon("maindir/fb.ico"));
  app.use(helmet());
  // Add static files
  app.use(express.static("public"));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // Configure template engine
  nunjucks.configure("views", {
    autospace: true,
    express: app
  });
  // Configure session
  const MongoStore = connectMongo(session);
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
  app.use(flash());
};

module.exports = configs;
