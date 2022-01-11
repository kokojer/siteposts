const User = require("../models/User");
const Role = require("../models/Role");
const { validationResult } = require("express-validator");
const createPath = require("../helpers/create-path");
const path = require('path')
const fs = require('fs')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = 'lololo';
const { nanoid } = require('nanoid')
const multer = require('multer');
const userObj = require('../helpers/userObj')
let error = false;

const generateAccessToken = (id, roles) => {
	const payload = {
		id,
		roles
	}
	return jwt.sign(payload, secret, { expiresIn: "24h" })
}

const handleError = (res, error) => {
	console.log(error);
	res.render(createPath('error'), { title: 'Error' });
}


//--------------------------------------
const getSignIn = (req, res) => {
	const title = "Sign-In";
	const errorValidationMessange = false;
	res.render(createPath("sign-in"), { errorValidationMessange, ...userObj(req, title) });
};

const postSignIn = async (req, res) => {
	const title = "Sign-In";
	try {
		const { username, password } = req.body
		const user = await User.findOne({ username })
		if (!user) {
			return res.render(createPath("sign-in"), {
				errorValidationMessange:
					`Пользователь ${username} не найден`,
				...userObj(req, title),
			})
		}
		const nickname = user.nickname;
		const img = user.img;
		const validPassword = bcrypt.compareSync(password, user.password)
		if (!validPassword) {
			return res.render(createPath("sign-in"), {
				errorValidationMessange:
					`Введен не верный пароль`,
				...userObj(req, title),
			})
		}
		const token = generateAccessToken(user._id, user.roles);

		return (
			res
				.cookie("token", token, {
					HttpOnly: true,

				})
				.cookie("nickname", nickname, {
					HttpOnly: true,

				})
				.cookie("username", username, {
					HttpOnly: true,

				})
				.cookie("img", img, {
					HttpOnly: true,

				})
				.redirect("/")
		);
	} catch (e) {
		console.log(e)
		res.status(400).json({ message: 'Login error' })
	}

	res.render(createPath("sign-in"), { ...userObj(req, title) });
};

const getSignUp = (req, res) => {
	const title = 'Sign-Up'
	const errorValidationMessange = false;
	res.render(createPath('sign-up'), {
		...userObj(req, title),
		errorValidationMessange
	});
};

const postSignUp = async (req, res) => {
	const title = "Sign-Up";
	try {
		const errors = validationResult(req);
		console.log(errors);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.render(createPath("sign-up"), {
					errorValidationMessange:
						errors.errors[0].msg,
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
//--------------------------------------------------
const getUser = async (req, res) => {
	const title = req.params.username;
	try {
		const title = req.params.username;
		let thisIsMe = false;
		const user = await User.findOne({ username: title })
		if (!user) {
			return res.render(createPath("error"), {
				title
			})
		}

		if (req.cookies.username === req.params.username) {
			console.log(user.aboutme);
			thisIsMe = true;
			return res.render(createPath("userPage"), {
				...userObj(req, title),
				thisIsMe,
				profileaboutme: user.aboutme,
				profileusername: user.username,
				profilenickname: user.nickname,
				profileuserImg: user.img || "/anonymous.jpg",
			});
		} else {
			return res.render(createPath("userPage"), {
				...userObj(req, title),
				thisIsMe,
				profileaboutme: user.aboutme,
				profileusername: user.username,
				profilenickname: user.nickname,
				profileuserImg: user.img || "/anonymous.jpg",
			});
		}
	} catch {
		return res.render(createPath("error"), {
			title
		})
	}
};
const getLogout = async (req, res) => {
	return (res.clearCookie('nickname').clearCookie('username').clearCookie('token').clearCookie('img').redirect(`/`))
}
const getEditUser = async (req, res) => {
	try {
		const title = req.params.username;
		const decodedData = jwt.verify(req.cookies.token, secret)
		const user = await User.findOne({ _id: decodedData.id })

		if (!user) {

			return res.render(createPath("error"), {
				title
			})
		} else if (user.username !== req.cookies.username) {

			return res.render(createPath("error"), {
				title
			})
		}

		if (req.params.username !== user.username) {
			return res.render(createPath("error"), {
				title
			})
		}


		return res.render(createPath("userEditPage"), {
			...userObj(req, title),
			error,
			profileaboutme: user.aboutme,
			profileusername: user.username,
			profilenickname: user.nickname,
			profileuserImg: req.cookies.img || "/anonymous.jpg",
		});
	} catch {
		return res.render(createPath("error"), {
			title
		})
	}
};

const addImg = async (req, res) => {
	const title = req.params.username;

	if (req.allowed === true) {
		error = false;
		if (req.cookies.img) {
			fs.unlink(`./images${req.cookies.img}`, function (err) {
				if (err) return console.log(err);
				console.log('file deleted successfully');
			})
		}

		return res.cookie("img", `/${req.file.filename}`, {
			HttpOnly: true,
		}).redirect(`/users/edit/${req.cookies.username}`);
	} else {
		error = true;
		return res.redirect(`/users/edit/${req.cookies.username}`);
	}
};

const postEditUser = async (req, res) => {
	const title = req.params.username;
	const decodedData = jwt.verify(req.cookies.token, secret)
	const { nickname, aboutme } = req.body;
	const img = req.cookies.img || "";
	const errors = validationResult(req);
	console.log(aboutme);
	if (!errors.isEmpty()) {
		console.log('4');
		return res.render(createPath("error"), {
			title
		});
	}
	User
		.findByIdAndUpdate(decodedData.id, { nickname, aboutme, img })
		.then((result) => {
			console.log('42');
			return res.cookie("nickname", `${nickname}`, {
				HttpOnly: true,
			}).redirect(`/users/${req.cookies.username}`)
		})
		.catch((error) => handleError(res, error));

	// if (req.allowed === true) {
	// 	error = false;
	// 	return res.cookie("img", `/${req.file.filename}`, {
	// 		HttpOnly: true,
	// 	}).redirect(`/users/edit/${req.cookies.username}`);
	// } else {
	// 	error = true;
	// 	return res.redirect(`/users/edit/${req.cookies.username}`);
	// }
};






module.exports = {
	getSignIn,
	getSignUp,
	postSignUp,
	postSignIn,
	getUser,
	getEditUser,
	getLogout,
	addImg,
	postEditUser
};
