const User = require("../models/User");
const Role = require("../models/Role");
const { validationResult } = require("express-validator");
const createPath = require("../helpers/create-path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = 'lololo';
const userObj = require('../helpers/userObj')




const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"} )
}

const getSignIn = (req, res) => {
  const title = "Sign-In";
  const errorValidationMessange = false;
  res.render(createPath("sign-in"), { ...userObj(req, title) });
};




const getSignUp = (req, res) => {
  const title = 'Sign-Up'
  const errorValidationMessange = false;
    res.render(createPath('sign-up'), {
      ...userObj(req,title),
      errorValidationMessange
    });
};

const postSignUp = async (req, res) => {
  const title = "Sign-Up";
  try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .render(createPath("sign-up"), {
            errorValidationMessange:
              "Вы не прошли валидацию, пароль должен содержать от 4 до 10 символов",
            ...userObj(req, title),
          });
      }
      const { username, password, nickname } = req.body;
      const candidate = await User.findOne({ username });
      if (candidate) {
        return res
          .status(400)
          .render(createPath("sign-up"), {
            errorValidationMessange:
              "Пользователь с таким именем уже существует",
            ...userObj(req, title),
          });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: "USER" });
      const user = new User({
        nickname,
        username,
        password: hashPassword,
        roles: [userRole.value],
      });
      await user.save();
      const token = generateAccessToken(user._id, user.roles);

      return (
        res
          // .setHeader("Set-Cookie", `token=${token};username=${username};HttpOnly`)
          .cookie("token", token, {
            HttpOnly: true,
            secure: true,
          })
          .cookie("nickname", nickname, {
            HttpOnly: true,
            secure: true,
          })
          .cookie("username", username, {
            HttpOnly: true,
            secure: true,
          })
          .redirect("/")
      );
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Registration error" });
  }
  
};



module.exports = {
  getSignIn,
  getSignUp,
  postSignUp,
};
