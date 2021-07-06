const Yup = require("yup");

exports.schema = Yup.object().shape({
  fullName: Yup.string().required().min(4).max(255),
  email: Yup.string().email().required(),
  password: Yup.string().required().min(4).max(25),
  confirmPassword: Yup.string()
    .required()
    .oneOf(
      [Yup.ref("password"), null],
      "pay attention passwords are not same!"
    ),
});
