// const bcrypt = require("bcryptjs");
const passport = require("passport");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { sendEmail } = require("../utils/mailer");

exports.login = (req, res) => {
  res.render("login", {
    pageTitle: "Login",
    path: "/login",
    message: req.flash("success-msg"),
    error: req.flash("error"),
  });
};

exports.handleLogin = async (req, res, next) => {
  if (!req.body["g-recaptcha-response"]) {
    req.flash("error", "please tick that you are not a robot");
    return res.redirect("/users/login");
  }

  const secretKey = process.env.CAPTCHA_SECRET;
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body["g-recaptcha-response"]}&remoteip=${req.connection.remoteAddress}`;
  const response = await fetch(verifyUrl, {
    method: "POST",
    header: {
      Accept: "application/json",
      "Content-Type": "application/x-www-from-urlencoded; charset=utf-8",
    },
  });

  const json = await response.json();
  if (json.success) {
    passport.authenticate("local", {
      // successRedirect: "/dashboard",
      failureRedirect: "/users/login",
      failureFlash: true,
    })(req, res, next);
  } else {
    req.flash("error", "please tick that you are not a robot");
    return res.redirect("/users/login");
  }
};

exports.rememberMe = (req, res) => {
  if (req.body.remember) {
    req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000;
  } else {
    req.session.cookie.expire = null;
  }
  res.redirect("/dashboard");
};

exports.logout = (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/users/login");
};

exports.register = (req, res) => {
  res.render("register", { pageTitle: "register", path: "/register" });
};

exports.createUser = async (req, res) => {
  const errors = [];
  try {
    await User.userValidation(req.body); //here check if there is problem it will go to catch

    //* checking email repeat
    const { fullName, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      errors.push({ message: "the email has been used" });
      return res.render("register", {
        pageTitle: "register",
        path: "/register",
        errors,
      });
    }
    await User.create({ fullName, email, password });
    sendEmail(email, fullName, "welcome", "it is a very good weblog");
    req.flash("success-msg", "Successfully registered now you can login");
    res.redirect("/users/login");
  } catch (error) {
    console.log(error);
    error.inner.forEach((e) => {
      errors.push({
        name: e.path,
        message: e.message,
      });
    });
    return res.render("register", {
      pageTitle: "register",
      path: "/register",
      errors,
    });
  }
};

exports.forgetPassword = async (req, res) => {
  res.render("forgetPass", {
    pageTitle: "Forget password",
    path: "/login",
    message: req.flash("success_msg"),
    error: req.flash("error"),
  });
};

exports.handleForgetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    req.flash("error", "there is not registered any account by the email");
    return res.render("forgetPass", {
      pageTitle: "Forget password",
      path: "/login",
      message: req.flash("success_msg"),
      error: req.flash("error"),
    });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const resetLink = `http://localhost:3000/users/reset-pass/${token}`;

  sendEmail(
    user.email,
    user.fullName,
    "Reset password",
    `
  for change password please click on the link
  <a href="${resetLink}">click me</a>`
  );

  req.flash("success_msg", "An email has been send please check your mailbox");
  res.render("forgetPass", {
    pageTitle: "Forget password",
    path: "/login",
    message: req.flash("success_msg"),
    error: req.flash("error"),
  });
};

exports.resetPassword = async (req, res) => {
  const token = req.params.token;
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log(err);
    if (!decodedToken) {
      return res.redirect("/404");
    }
  }

  res.render("private/resetPass", {
    pageTitle: "Reset password",
    path: "/login",
    message: req.flash("success_msg"),
    error: req.flash("error"),
    userId: decodedToken.userId,
  });
};

exports.handleResetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash("error", "passwords are not same");
    return res.render("private/resetPass", {
      pageTitle: "Reset password",
      path: "/login",
      message: req.flash("success_msg"),
      error: req.flash("error"),
      userId: req.params.id,
    });
  }

  const user = await User.findOne({ _id: req.params.id });

  if (!user) {
    return res.redirect("/404");
  }

  user.password = password;
  await user.save();

  req.flash("success_msg", "new password has been saved");
  res.redirect("/users/login");
};
