const res = require("express/lib/response");
const User = require("../models/User");

const userObj = async (req, title) => {
	try {
		const user = await User.findOne({ username: req.cookies?.username });
		return {
			title,
			isAuth: req.isAuth,
			username: user?.username,
			nickname: user?.nickname,
			userImg: user?.img || "/anonymous.jpg",
		};
	} catch (error) {
		return res.send('error');
	}

};

module.exports = userObj;
