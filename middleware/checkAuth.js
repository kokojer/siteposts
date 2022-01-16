const User = require("../models/User");
const jwt = require("jsonwebtoken");
const secret = 'lololo'

module.exports = function () {
	return async function (req, res, next) {

		if (req.cookies.token) {
			let decodedData
			try {
				decodedData = jwt.verify(req.cookies.token, secret);
			} catch (err) {
				return (res.clearCookie('nickname').clearCookie('username').clearCookie('token').clearCookie('img').redirect(`/`))
			}
			const user = await User.findOne({
				_id: decodedData.id,
			});

			if (!user) {
				return res.render(createPath("error"), {
					title,
				});
			}
			if (user.username !== req.cookies.username) {
				return res.render(createPath("error"), {
					title,
				});
			}
			req.isAuth = true;
			req.user = user;
		} else {
			req.isAuth = false;
		}
		next();
	};
};
