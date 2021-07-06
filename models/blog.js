const mongoose = require("mongoose");

const { schema } = require("./secure/postValidation");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
    trim: true,
    minlength: 4,
    maxlength: 100,
  },
  body: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    default: "public",
    enum: ["public", "private"],
  },
  thumbnail: {
    type: String,
    require: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

blogSchema.index({ title: "text" });

blogSchema.statics.postValidation = function (body) {
  return schema.validate(body, { abortEarly: false });
};

module.exports = mongoose.model("Blog", blogSchema);
