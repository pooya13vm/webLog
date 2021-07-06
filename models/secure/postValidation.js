const Yup = require("yup");

exports.schema = Yup.object().shape({
  title: Yup.string().required("post must has title").min(4).max(100),
  body: Yup.string().required("post must has content"),
  status: Yup.mixed().oneOf(["public", "private"]),

  thumbnail: Yup.object().shape({
    name: Yup.string().required("Thumbnail image is required"),
    size: Yup.number().max(3000000, "Image could not br more than 3 MB"),
    mimetype: Yup.mixed().oneOf(
      ["image/jpeg", "image/png"],
      "format must be jpeg or png"
    ),
  }),
});
