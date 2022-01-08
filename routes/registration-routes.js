const express = require("express");
const createPath = require("../helpers/create-path");
const { check } = require("express-validator");
const checkAuth = require("../middleware/checkAuth");
const router = express.Router();

const cookieParser = require("cookie-parser");
const {
  getSignIn,
  getSignUp,
  postSignUp,
} = require("../controllers/registration-controller");

router.get("/sign-in",cookieParser('secret key'),checkAuth(), getSignIn);

router.get("/sign-up", cookieParser("secret key"), checkAuth(), getSignUp);

router.post(
  "/sign-up",
  [
    check(
      "password",
      "Пароль должен быть больше 4 и меньше 10 символов"
    ).isLength({ min: 4, max: 10 }),
  ],
  postSignUp
);


router.get("/cookies", cookieParser('secret key'), function getCookieS(req, res) {
        console.log("Cookie " + JSON.stringify(req.cookies))
      //  console.log(getCookie("token"));

    });

module.exports = router;
