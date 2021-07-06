const { Router } = require("express");

const blogController = require("../controllers/blogController");
const router = new Router();

//*! weblog Index page
router.get("/", blogController.getIndex);
router.get("/post/:id", blogController.getSinglePost);
router.get("/blogs/:id", blogController.getSinglePost);
router.get("/contact", blogController.contactPage);
router.get("/captcha.png", blogController.getCaptcha);

router.post("/contact", blogController.handleContactPage);
router.post("/search", blogController.handlerSearch);
module.exports = router;
