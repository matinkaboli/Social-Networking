function configs(app, express, bodyParser, nunjucks, session, helmet) {
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
  const configSession = {
    secret: "m@tinnim@125session",
    cookie: {
      maxAge: 7 * 24 * 3600 * 1000,
      httpOnly: true
    },
    resave: false,
    saveUninitialized: true
  };
  app.use(session(configSession));
}

module.exports = configs;
