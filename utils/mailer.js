const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transportDetails = smtpTransport({
  //   host: "Gmail",
  service: "gmail",
  host: "smtp.gmail.com",
  post: 465,
  secure: true,
  auth: {
    user: "pooya13vm@gmail.com",
    pass: "Moghadam14",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.sendEmail = (email, fullName, subject, message) => {
  const transporter = nodemailer.createTransport(transportDetails);
  transporter.sendMail(
    {
      from: "pooya13vm@gmail.com",
      to: email,
      subject: subject,
      html: `<h1>welcome to my blog ${fullName}</h1>
      <p>${message}</p>`,
    },
    (err, info) => {
      if (err) return console.log(err);
      console.log(info);
    }
  );
};
