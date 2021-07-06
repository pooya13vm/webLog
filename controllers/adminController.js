const fs = require("fs");

const multer = require("multer");
const sharp = require("sharp");
const shortId = require("shortid");
const appRoot = require("app-root-path");

const blog = require("../models/blog");
const { get500 } = require("../controllers/errorController");
const { fileFilter } = require("../utils/multer");

exports.getDashboard = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 10;

  try {
    const numberOfPost = await blog
      .find({ user: req.user._id })
      .countDocuments();
    const blogs = await blog
      .find({ user: req.user._id })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.render("private/blogs", {
      pageTitle: "manager dashboard",
      path: "/dashboard",
      layout: "./layouts/dashLayout",
      fullName: req.user.fullName,
      blogs,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPost,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPost / postPerPage),
    });
  } catch (err) {
    console.log(err);
    get500(req, res);
  }
};

exports.getAddPost = (req, res) => {
  res.render("private/addPost", {
    pageTitle: "make new post",
    path: "/dashboard/add-post",
    layout: "./layouts/dashLayout",
    fullName: req.user.fullName,
  });
};

exports.getEditPost = async (req, res) => {
  const post = await blog.findOne({
    _id: req.params.id,
  });
  if (!post) {
    return res.redirect("errors/404");
  }
  if (post.user.toString() != req.user._id) {
    return res.redirect("/dashboard");
  } else {
    res.render("private/editPost", {
      pageTitle: "Edit post | manager",
      path: "/dashboard/edit-post",
      layout: "./layouts/dashLayout",
      fullName: req.user.fullName,
      post,
    });
  }
};

exports.CreatePost = async (req, res) => {
  const errorArr = [];
  const thumbnail = req.files ? req.files.thumbnail : {};
  const fileName = `${shortId.generate()}_${thumbnail.name}`;
  const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
  try {
    req.body = { ...req.body, thumbnail };
    await blog.postValidation(req.body);
    await sharp(thumbnail.data)
      .jpeg({ quality: 60 })
      .toFile(uploadPath)
      .catch((err) => console.error(err));
    await blog.create({ ...req.body, user: req.user.id, thumbnail: fileName });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    errorArr.push({
      message: err,
    });

    res.render("private/addPost", {
      pageTitle: "make new post",
      path: "/dashboard/add-post",
      layout: "./layouts/dashLayout",
      fullName: req.user.fullName,
      errors: errorArr,
    });
  }
};

exports.editPost = async (req, res) => {
  const errorArr = [];
  const thumbnail = req.files ? req.files.thumbnail : {};
  const fileName = `${shortId.generate()}_${thumbnail.name}`;
  const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
  const post = await blog.findOne({
    _id: req.params.id,
  });
  try {
    if (thumbnail.name) await blog.postValidation({ ...req.body, thumbnail });
    else
      await blog.postValidation({
        ...req.body,
        thumbnail: { name: "placeholder", size: 0, mimetype: "image/jpeg" },
      });

    if (!post) {
      return res.redirect("errors/404");
    }
    if (post.user.toString() != req.user._id) {
      return res.redirect("/dashboard");
    } else {
      if (thumbnail.name) {
        fs.unlink(
          `${appRoot}/public/uploads/thumbnails/${post.thumbnail}`,
          async (err) => {
            if (err) console.log(err);
            else {
              await sharp(thumbnail.data)
                .jpeg({ quality: 60 })
                .toFile(uploadPath)
                .catch((err) => console.error(err));
            }
          }
        );
      }

      const { title, status, body } = req.body;
      post.title = title;
      post.status = status;
      post.body = body;
      post.thumbnail = thumbnail.name ? fileName : post.thumbnail;

      await post.save();
      return res.redirect("/dashboard");
    }
  } catch (err) {
    err.inner.forEach((e) => {
      errorArr.push({
        name: e.path,
        message: e.message,
      });
    });
    res.render("private/editPost", {
      pageTitle: "Edit post",
      path: "/dashboard/edit-post",
      layout: "./layouts/dashLayout",
      fullName: req.user.fullName,
      errors: errorArr,
      post,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await blog.findOne({ _id: req.params.id });
    fs.unlinkSync(`${appRoot}/public/uploads/thumbnails/${post.thumbnail}`);
    await blog.findByIdAndRemove(req.params.id);
    return res.redirect("/dashboard");
  } catch (err) {
    res.render("errors/500");
  }
};

exports.uploadImage = (req, res) => {
  const upload = multer({
    limits: { fileSize: 4000000 },
    fileFilter: fileFilter,
  }).single("image");

  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).send("image size must not be more than 4Mb");
      }
      res.status(400).send(err);
    } else {
      if (req.file) {
        const fileName = `${shortId.generate()}_${req.file.originalname}`;
        await sharp(req.file.buffer)
          .jpeg({ quality: 60 })
          .toFile(`./public/uploads/${fileName}`)
          .catch((err) => console.log(err));
        res.status(200).send(`http://localhost:3000/uploads/${fileName}`);
      } else {
        res.send("choose a image to upload");
      }
    }
  });
};

exports.handleSearch = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 10;

  try {
    const numberOfPost = await blog
      .find({ user: req.user._id, $text: { $search: req.body.search } })
      .countDocuments();
    const blogs = await blog
      .find({ user: req.user._id, $text: { $search: req.body.search } })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.render("private/blogs", {
      pageTitle: "manager dashboard",
      path: "/dashboard",
      layout: "./layouts/dashLayout",
      fullName: req.user.fullName,
      blogs,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPost,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPost / postPerPage),
    });
  } catch (err) {
    console.log(err);
    get500(req, res);
  }
};
