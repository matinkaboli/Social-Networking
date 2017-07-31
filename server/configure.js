function configs(app, express, session, bodyParser, nunjucks, multer) {
  // Add static files
  app.use(express.static("public"));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // Configure session
  app.use(session({
    secret: 'm@tinnim@125session',
    cookie: {
      maxAge: 7 * 24 * 3600 * 1000,
      httpOnly: true
    },
    resave: false,
    saveUninitialized: true
  }));
  /* app.use(multer({
   * dest: "public/profile"
   * }));
   */
  // Configure template engine
  nunjucks.configure("views", {
    autospace: true,
    express: app
  });
}

module.exports = configs;
