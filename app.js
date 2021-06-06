//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/secretsDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = {
  email: {
    type: String,
    required: 1
  },
  password: {
    type: String,
    required: 1
  }
};

const User = mongoose.model("user", userSchema);

app.listen(3000, () => {
  console.log("Server up and running on Port 3000");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  User.findOne({email: req.body.email}, (err, user) => {
    if(!err) {
      if(user) {
        if(user.password == req.body.password) {
          res.render("secrets");
        } else {
          res.send("No Such user");
        }
      } else {
        res.send("No Such user");
      }
    }
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  User.findOne({email: req.body.email}, (err, doc) => {
    if(!err) {
      if(doc) {
        res.send("Already registered");
      } else {
        const newUser = new User({
          email: req.body.email,
          password: req.body.password
        });
        newUser.save();
        res.send("User signed up successfully");
      }
    }
  });
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});
