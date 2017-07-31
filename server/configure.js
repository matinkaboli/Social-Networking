function configs(app, express, session, bodyParser, nunjucks) {
  app.use(express.static("public"));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(session({
    secret: 'm@tinnim@125session',
    cookie: {
      maxAge: 7 * 24 * 3600 * 1000,
      httpOnly: true
    },
    resave: false,
    saveUninitialized: true
  }));
  nunjucks.configure("views", {
    autospace: true,
    express: app
  });
}

module.exports = configs;
