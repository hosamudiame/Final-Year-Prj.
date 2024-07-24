//jshint esversion:6
require("dotenv").config();
const nodemailer = require("nodemailer");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const time = new Date().getMilliseconds();
const randomNum = Math.floor(Math.random()*237);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
  }
}); 

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb://Project-5:${process.env.PASS}@host:port/database?ssl=true&tlsInsecure=false&tlsVersion=TLS1_2`);

const userSchema = new mongoose.Schema({
  username: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/requestaccess", function (req, res) {
  res.sendFile(__dirname + "/request-access.html");
}); 

app.get("/mycontrols", function (req, res) {
  if (req.isAuthenticated()) {
    res.sendFile(__dirname + "/app.html");
  } else {
    res.redirect("/");
  }
});

app.post('/requestaccess', async (req, res) => {
  const email = req.body.email;
  const slice = req.body.email.slice(0,3);
  const joined = slice + randomNum + time;
  const username = email;
  const password = joined;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.json({ success: false, error: "User already exists" });
    }

    // Create new user
    User.register(new User({ username: username }), password, function(err, user) {
      if (err) {
        console.error(err);
        return res.json({ success: false, error: err.message });
      }

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: email,
        subject: 'Your Credentials',
        text: `Hello,\n\nHere are your credentials:\n\nUsername: ${username}\nPassword: ${password}\n\nPlease log in and change your password.`,
        html: `<p>Hello,</p><p>Here are your credentials:</p><p>Username: <strong>${username}</strong></p><p>Password: <strong>${password}</strong></p><p>Please log in and change your password.</p>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.json({ success: false, error: error.message });
        }
        res.json({ success: true, message: "User registered successfully. Please check your email for login credentials." });
      });
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: error.message });
  }
});

app.post("/login", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) { 
      console.error(err);
      return res.json({ success: false, error: "An error occurred during login" }); 
    }
    if (!user) { 
      return res.json({ success: false, error: "Incorrect username or password" }); 
    }
    req.logIn(user, function(err) {
      if (err) { 
        console.error(err);
        return res.json({ success: false, error: "An error occurred during login" }); 
      }
      return res.json({ success: true, redirect: "/mycontrols" });
    });
  })(req, res, next);
});

// app.get("/logout", function(req, res) {
//   req.logout(function(err) {
//     if (err) { 
//       console.error(err);
//       return res.json({ success: false, error: "An error occurred during logout" }); 
//     }
//     res.redirect("/");
//   });
// });

app.listen( process.env.PORT || 3000, () => {
  console.log("server is running..");
});