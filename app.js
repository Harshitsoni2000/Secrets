//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//-----MONGOOSE ENCRYPTION--------
// const encrypt = require("mongoose-encryption");
//-----SHA512---------------------
// const sha512 = require("js-sha512").sha512;
//-----BCRYPT---------------------
// const bcrypt = require("bcrypt");
// const saltRounds = 11;
//-----PASSPORT-------------------
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

//-----PASSPORT-------------------
app.use(session({
  secret: "This is a very very long secret string written by me.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//--------------------------------

mongoose.connect("mongodb://localhost:27017/secretsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const userSchema = new mongoose.Schema({
  username:String,
  password:String
});

//-----PASSPORT-LOCAL-MONGOOSE-------------------
userSchema.plugin(passportLocalMongoose);


//-----MONGOOSE ENCRYPTION--------
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("user", userSchema);

//-----PASSPORT-LOCAL-MONGOOSE-------------------
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//-----------------------------------------------

app.listen(3000, () => {
  console.log("Server up and running on Port 3000");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/secrets", (req, res) => {
  if(req.isAuthenticated())
    res.render("secrets");
  else
    res.redirect("login");
});

app.route("/login")
.get((req, res) => {
  res.render("login");
})
.post((req, res) => {
  // User.findOne({
  //   username: req.body.username
  // }, (err, user) => {
  //   if (!err) {
  //     if (user) {
  //       bcrypt.compare(req.body.password, user.password, function(err, result) {
  //         if (result == true) {
  //           res.render("secrets");
  //         } else {
  //           res.send("No Such user");
  //         }
  //       });
  //     } else {
  //       res.send("No Such user");
  //     }
  //   }
  // });

  // -----PASSPORT-LOG-IN-------------------
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, (err) => {
    if(err) {
      console.log(err);
    } else {
      passport.authenticate("local", { successRedirect:'/secrets', failureRedirect: '/logout' })(req, res, () => {
        // res.redirect("/secrets");
      });
    }
  });
});

app.route("/register")
.get((req, res) => {
  res.render("register");
})
.post((req, res) => {
  // User.findOne({
  //   username: req.body.username
  // }, (err, doc) => {
  //   if (!err) {
  //     if (doc) {
  //       res.send("Already registered");
  //     } else {
  //       bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
  //         const newUser = new User({
  //           username: req.body.username,
  //           password: hash
  //         });
  //         newUser.save();
  //         res.send("User signed up successfully");
  //       });
  //     }
  //   }
  // });

  // -----PASSPORT-LOCAL-MONGOOSE-------------------
  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if(err) {
      res.send(err.message);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/logout", (req, res) => {
  // -----PASSPORT-LOG-IN-------------------
  req.logout();
  res.redirect("/");
});
