var db = require("../models");
var protected = require("../ServerServices/routeAuthorization");
var Op = db.Sequelize.Op;
require("dotenv").config();
var flights = require("../ServerServices/Services/FlightService")(process.env.AE_SECRET);




module.exports = function (app) {
  // read the info at this path

  app.get("/api/users", protected(), function (req, res) {
    //console.log(flights.makeApiCall({ dest: "Seattle", home: "Portland" }));

    console.log(req);
    // req.query is the result of the query
    console.log(req.query);
    db.User.findAll({
      where: {
        city: req.query.city
      }
    }).then(function (users) {
      console.log(users);
    })
  })
  // create
  app.post("/users", protected(), function (req, res) {
    db.User.create({
      name: req.body.name,
      city: req.body.city,
      countryTwo: req.body.countryTwo,
      cityTwo: req.body.cityTwo,
      photo: req.body.photo,
      age: req.body.age,
      lang: req.body.lang,
      secLang: req.body.secLang,
      bio: req.body.bio,
      email: req.body.email,
      userName: req.body.username
    }).then(function (userData) {
      res.json(userData);
    });

  });

  app.get("/user", protected(), function (req, res){
      db.User.findOne({
        where: { 
          [Op.or]: [{
            email: req.query.email
          }]
        }
      }).then(function (user) {
        res.json(user);
      });

  });


  app.get("/matches", protected(), function (req, res) {
    let temp;

    db.User.findOne({
        where: {
          [Op.or]: [{
            email: req.query.email
          }]
        }
      }).then(function (user) {

        return db.User.findAll({
          where: {
            [Op.or]: [{
                city: user.cityTwo
              },
            ],
          },

        });

      }).then(function (matchingUsers) {
        temp = matchingUsers;
        console.log('here ---->', temp.length)
        // if there is a match, then do the for loop
        if (temp.length > 0) {
          for (var i = 0; i < temp.length; i++) {
            if (temp[i].city == req.query.city) {
              console.log('matching name:', temp[i].name, ': ', temp[i].city, 'city/country');
              // matching city is working. logging out matching city
            } else if (temp[i].countryTwo == req.query.countryTwo) {
              console.log('Matching country: ', temp[i].countryTwo, 'matching name: ', temp[i].name);
            } else if (temp[i].cityTwo == req.query.cityTwo) {
              console.log('matching city to visit: ', temp[i].cityTwo + ' with: ', temp[i].name)
            } else {
              console.log('matches')
            }
          }
        }
        res.json(matchingUsers);
      });
  });

}