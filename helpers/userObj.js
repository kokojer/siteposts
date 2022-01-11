const userObj = (req, title) => {
	return {
		title,
		isAuth: req.isAuth,
		username: req.cookies?.username,
		nickname: req.cookies?.nickname,
		userImg: req.cookies?.img || "/anonymous.jpg",
	};
};

module.exports = userObj;