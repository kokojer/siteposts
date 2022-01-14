const User = require("../models/User");

const userObj = async (req, title) => {
  const user = await User.findOne({ username: req.cookies?.username });
  return {
    title,
    isAuth: req.isAuth,
    username: user?.username,
    nickname: user?.nickname,
    userImg: user?.img || "/anonymous.jpg",
  };
};

module.exports = userObj;
