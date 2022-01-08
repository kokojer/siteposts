
module.exports = function () {
  return function (req, res, next) {
    if (req.cookies.token) {
      req.isAuth = true;
    } else {
      req.isAuth = false;
    }
    next();
  };
};
