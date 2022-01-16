//---подключение моделей данных--------
const User = require("../models/User");
const Role = require("../models/Role");
//---подключение валидации инпутов--------
const {
	validationResult
} = require("express-validator");
const createPath = require("../helpers/create-path");
const path = require('path')
const fs = require('fs')
const url = require('url');
//---для защиты данных--------
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = 'lololo';
//---объект в хедере--------
const userObj = require('../helpers/userObj')
//--генерация токена----------
const generateAccessToken = (id, roles) => {
	const payload = {
		id,
		roles
	}
	return jwt.sign(payload, secret, {
		expiresIn: "10d"
	})
}

const handleError = (res, error) => {
	console.log(error);
	res.render(createPath('error'), {
		title: 'Error'
	});
}

//---функции обрабочики логина и регистрации
//--------------------------------------
const getSignIn = async (req, res) => {
	const title = "Sign-In";
	const obj = await userObj(req, title);
	return res.render(createPath("sign-in"), {
		errorValidationMessange: false,
		...obj
	});
};

const postSignIn = async (req, res) => {
	const title = "Sign-In";
	const obj = await userObj(req, title);
	try {
		const {
			username,
			password
		} = req.body
		const user = await User.findOne({
			username
		})
		if (!user) {
			return res.render(createPath("sign-in"), {
				errorValidationMessange: `Пользователь ${username} не найден`,
				...obj,
			})
		}
		const nickname = user.nickname;
		const img = user.img;
		const validPassword = bcrypt.compareSync(password, user.password)
		if (!validPassword) {
			return res.render(createPath("sign-in"), {
				errorValidationMessange: `Введен не верный пароль`,
				...obj,
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
		res.status(400).json({
			message: 'Login error'
		})
	}


};

const getSignUp = async (req, res) => {
	const title = 'Sign-Up'
	const obj = await userObj(req, title);
	return res.render(createPath('sign-up'), {
		...obj,
		errorValidationMessange: false
	});
};

const postSignUp = async (req, res) => {
	const title = "Sign-Up";
	const obj = await userObj(req, title);
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.render(createPath("sign-up"), {
					errorValidationMessange: errors.errors[0].msg,
					...obj,
				});
		}
		const {
			username,
			password,
			nickname
		} = req.body;
		const candidate = await User.findOne({
			username
		});
		if (candidate) {
			return res
				.status(400)
				.render(createPath("sign-up"), {
					errorValidationMessange: "Пользователь с таким именем уже существует",
					...obj,
				});
		}
		const hashPassword = bcrypt.hashSync(password, 7);
		const userRole = await Role.findOne({
			value: "USER"
		});
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
		res.status(400).json({
			message: "Registration error"
		});
	}

};
//--------------------------------------------------
const getUser = async (req, res) => {
	const title = req.params.username;
	const obj = await userObj(req, title);
	try {
		const title = req.params.username;
		let thisIsMe = false;
		const user = await User.findOne({
			username: title
		})
		if (!user) {
			return res.render(createPath("error"), {
				title
			})
		}

		if (req.cookies.username === req.params.username) {

			thisIsMe = true;
			return res.render(createPath("userPage"), {
				...obj,
				thisIsMe,
				profileaboutme: user.aboutme,
				profileusername: user.username,
				profilenickname: user.nickname,
				profileuserImg: user.img || "/anonymous.jpg",
				profileage: user.age || "Empty",
				profilesex: user.sex || "Empty",
				profileprofession: user.profession || "Empty",
				profilecountry: user.country || "Empty",
				profilecity: user.city || "Empty",
			});
		} else {
			return res.render(createPath("userPage"), {
				...obj,
				thisIsMe,
				profileaboutme: user.aboutme,
				profileusername: user.username,
				profilenickname: user.nickname,
				profileuserImg: user.img || "/anonymous.jpg",
				profileage: user.age || "Empty",
				profilesex: user.sex || "Empty",
				profileprofession: user.profession || "Empty",
				profilecountry: user.country || "Empty",
				profilecity: user.city || "Empty",
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
	const title = req.params.username;
	const obj = await userObj(req, title);
	try {
		const user = req.user;

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
		let valid = req.query.valid;
		return res.render(createPath("userEditPage"), {
			...obj,
			error: valid,
			profileaboutme: user.aboutme,
			profileusername: user.username,
			profilenickname: user.nickname,
			profileuserImg: req.cookies.img || user.img || "/anonymous.jpg",
			profileage: user.age,
			profilesex: user.sex,
			profileprofession: user.profession,
			profilecountry: user.country,
			profilecity: user.city,
		});
	} catch {
		return res.render(createPath("error"), {
			title
		})
	}
};

const addImg = async (req, res) => {
	try {
		if (req.allowed === true) {
			let title = ' '
			const obj = await userObj(req, title);
			if (req.cookies.img) {
				if (obj.userImg !== req.cookies.img) {

					fs.unlink(`./images${req.cookies.img}`, function (err) {
						if (err) return console.log(err);
						console.log("file deleted successfully-repeat");
					});
				}
			}
			return res
				.cookie("img", `/${req.file.filename}`, {
					HttpOnly: true,
				})
				.redirect(`/users/edit/${req.cookies.username}`);
		} else {
			return res.redirect(url.format({
				pathname: `/users/edit/${req.cookies.username}`,
				query: {
					"valid": 'Допустимые форматы изображний: PNG, JPG, SVG'
				}
			}));
		}
	} catch (err) {
		return res.render(createPath("error"), {
			title
		})
	}

};

const postEditUser = async (req, res) => {
	const title = req.params.username;
	try {
		let decodedData
		try {
			decodedData = jwt.verify(req.cookies.token, secret);
		} catch (err) {
			return (res.clearCookie('nickname').clearCookie('username').clearCookie('token').clearCookie('img').redirect(`/`))
		}
		const {
			nickname,
			age,
			sex,
			profession,
			city,
			country
		} = req.body;
		const img = req.cookies.img || "";
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			let error = errors.errors[0].msg
			return res.redirect(url.format({
				pathname: `/users/edit/${req.cookies.username}`,
				query: {
					"valid": error
				}
			}))
		}


		if (req.cookies.img) {
			let userImg = await User.findOne({
				_id: decodedData.id,
			});
			if (userImg.img !== req.cookies.img) {
				fs.unlink(`./images${userImg.img}`, function (err) {
					if (err) return console.log(err);
					console.log("file deleted successfully");
				});
			}
		}
		User.findByIdAndUpdate(decodedData.id, {
			nickname,
			age,
			sex,
			profession,
			city,
			country,
			img
		}).then((result) => {
			return res
				.cookie("nickname", `${nickname}`, {
					HttpOnly: true,
				})
				.redirect(`/users/${req.cookies.username}`);
		}).catch((error) => handleError(res, error));
	} catch (error) {
		return res.render(createPath("error"), {
			title
		})
	}

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