const Yup = require("yup");
const captcha = require("captchapng");
const blog = require("../models/blog");
const { dateformat, truncate } = require("../utils/helpers");
const { sendEmail } = require("../utils/mailer");

let CAPTCHA_NUM;

exports.getIndex = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 2;
  try {
    const numberOfPost = await blog.find({ status: "public" }).countDocuments();
    const posts = await blog
      .find({ status: "public" })
      .sort({ createdAt: "desc" })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.render("index", {
      pageTitle: "WEBLog",
      path: "/",
      posts,
      dateformat,
      truncate,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPost,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPost / postPerPage),
    });
  } catch (err) {
    console.log(err);
    res.render("errors/500");
  }
};

exports.getSinglePost = async (req, res) => {
  try {
    const post = await blog.findOne({ _id: req.params.id }).populate("User");
    if (!post) return res.redirect("errors/404");
    res.render("post", {
      pageTitle: post.title,
      path: "/post",
      post,
      dateformat,
    });
    console.log(post);
  } catch (err) {
    console.log(err);
    res.render("errors/500");
  }
};

exports.contactPage = (req, res) => {
  res.render("contact", {
    pageTitle: "contact us",
    path: "/contact",
    message: req.flash("success_msg"),
    error: req.flash("error"),
    errors: [],
  });
};

exports.handleContactPage = async (req, res) => {
  const errorArr = [];

  const { fullName, email, message, captcha } = req.body;

  exports.schema = Yup.object().shape({
    fullName: Yup.string().required(
      "please write your name or your company name"
    ),
    email: Yup.string()
      .email("the email is not available")
      .required("please write your email"),
    message: Yup.string().required("message must has content"),
  });

  try {
    await this.schema.validate(req.body, { abortEarly: false });

    if (parseInt(captcha) === CAPTCHA_NUM) {
      sendEmail(
        "pooya_vm@yahoo.com",
        fullName,
        "from povamo weblog",
        `${message} <br/> user email ${email}<br/> name:${fullName}`
      );
      req.flash("success_msg", "message successfully has been send");
      return res.render("contact", {
        pageTitle: "contact us",
        path: "/contact",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        errors: errorArr,
      });
    }
    req.flash("error", "security code is not true");
    res.render("contact", {
      pageTitle: "contact us",
      path: "/contact",
      message: req.flash("success_msg"),
      error: req.flash("error"),
      errors: errorArr,
    });
  } catch (err) {
    err.inner.forEach((e) => {
      console.log(e.errors[0]);
      errorArr.push({
        name: e.path,
        message: e.errors[0],
      });
    });
    res.render("contact", {
      pageTitle: "contact us",
      path: "/contact",
      message: req.flash("success_msg"),
      error: req.flash("error"),
      errors: errorArr,
    });
  }
};

exports.getCaptcha = (req, res) => {
  CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);
  const p = new captcha(80, 30, CAPTCHA_NUM);
  p.color(0, 0, 0, 0);
  p.color(80, 80, 80, 255);

  const img = p.getBase64();
  const imgBase64 = Buffer.from(img, "base64");

  res.send(imgBase64);
};

exports.handlerSearch = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 2;
  try {
    const numberOfPost = await blog
      .find({ status: "public", $text: { $search: req.body.search } })
      .countDocuments();
    const posts = await blog
      .find({ status: "public", $text: { $search: req.body.search } })
      .sort({ createdAt: "desc" })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.render("index", {
      pageTitle: "search result",
      path: "/",
      posts,
      dateformat,
      truncate,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPost,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPost / postPerPage),
    });
  } catch (err) {
    console.log(err);
    res.render("errors/500", {
      pageTitle: "search result",
      path: "/404",
    });
  }
};
