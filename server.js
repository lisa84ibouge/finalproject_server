// Use a Node and Express Web Server;
// Be backed by a MySQL Database an ORM (not necessarily Sequelize);
// Have both GET and POST routes for retrieving and adding new data;
// Be deployed using Heroku (with Data);
// Utilize at least one new library, package, or technology that we haven’t discussed;
// Have a polished frontend / UI;
// Have folder structure that meets MVC Paradigm;
// Meet good quality coding standards (indentation, scoping, naming).
// Must not expose sensitive API key information on the server, see Protecting-API-Keys-In-Node.md

require("dotenv").config();
var express = require("express");
var db = require("./models");
var app = express();
var session = require("express-session");
var passport = require("passport");
var Auth0Strategy = require("passport-auth0");
var viewUser = require("./ServerServices/User");

var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

var jwtCheck = jwt({
      secret: jwks.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: 'https://dev-2b-g4sx1.auth0.com/.well-known/jwks.json'
    }),
    audience: 'userService',
    issuer: 'https://dev-2b-g4sx1.auth0.com/',
    algorithms: ['RS256']
});

app.use(jwtCheck);

/*
//Setup for authentication
var sess = {
  secret: "testsecret",
  cookie: {},
  resave: false,
  saveUninitialized: true
};

var startegy = new Auth0Strategy({
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: process.env.AUTH0_CALLBACK_URL || "http://localhost:8080/callback",
}, (accessToken, refresToken, extraPrams, profile, done) => {
  return done(null, profile);
});
passport.use(startegy);
*/
var PORT = process.env.PORT || 8080;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


// codes for cors..
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

/*passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});


app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());
app.use(viewUser());
*/

// Routes
require("./routes/authRoutes")(app);
require("./routes/apiRoutes")(app);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function () {
  app.listen(PORT, function () {
    console.log("Listening on port: http://localhost:" + PORT);
  });
});
