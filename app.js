//* internal modules
const path = require("path");

//* external modules
const express = require("express");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const expressLayout = require("express-ejs-layouts");
const dotEnv = require("dotenv");
const morgan = require("morgan");
const debug = require("debug")("weblog");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");

//* import my modules
const connectDB = require("./config/db");
const winston = require("./config/winston");

//*? define and config modules
const app = express();
require("./config/passport"); // password configuration
dotEnv.config({ path: "./config/config.env" });
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//*? session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      autoRemove: "interval",
      autoRemoveInterval: 10,
    }),
  })
);

// password
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());

//*! logging (morgan)
if (process.env.NODE_ENV == "development") {
  debug("Morgan Enabled");
  app.use(morgan("combined", { stream: winston.stream }));
}

//*! database connection
connectDB();
debug("connected to database");

//*! View Engin
app.use(expressLayout);
app.set("layout", "./layouts/mainLayout");
app.set("view engine", "ejs");
app.set("views", "views");

//*! file upload middleware
app.use(fileUpload());

//*! static folder
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, process.env.BOOTSTRAP)));
app.use(express.static(path.join(__dirname, process.env.FONTAWESOME)));

//*! Router
app.use("/", require("./routes/blog"));
app.use("/users", require("./routes/users"));
app.use("/dashboard", require("./routes/dashboard"));

//*! 404 page
app.use(require("./controllers/errorController").get404);

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  debug(`server is running on port ${PORT} in ${process.env.NODE_ENV} mode`)
);
