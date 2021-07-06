exports.fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg") {
    cb(null, true);
  } else {
    cb("only jpeg file can upload", false);
  }
};
