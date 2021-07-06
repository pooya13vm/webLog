const { Router } = require("express");
const { authenticated } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

const router = new Router();

router.get("/", authenticated, adminController.getDashboard);
router.get("/add-post", authenticated, adminController.getAddPost);
router.get("/edit-post/:id", authenticated, adminController.getEditPost);
router.get("/delete-post/:id", authenticated, adminController.deletePost);

router.post("/add-post", authenticated, adminController.CreatePost);
router.post("/edit-post/:id", authenticated, adminController.editPost);

// handle image upload
router.post("/image-upload", authenticated, adminController.uploadImage);
// search handler
router.post("/search", authenticated, adminController.handleSearch);

module.exports = router;
