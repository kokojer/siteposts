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
		username: undefined,
		password: undefined,
		nickname: undefined,
		...obj,
		errorValidationMessange: false
	});
};

const postSignUp = async (req, res) => {
	const title = "Sign-Up";
	const obj = await userObj(req, title);
	try {
		const {
			username,
			password,
			nickname
		} = req.body;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.render(createPath("sign-up"), {
					errorValidationMessange: errors.errors[0].msg,
					...obj,
					username,
					password,
					nickname,
				});
		}
		const candidate = await User.findOne({
			username
		});
		if (candidate) {
			return res
				.status(400)
				.render(createPath("sign-up"), {
					errorValidationMessange: "Пользователь с таким именем уже существует",
					...obj,
					username,
					password,
					nickname,
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







module.exports = {
	getSignIn,
	getSignUp,
	postSignUp,
	postSignIn,
};