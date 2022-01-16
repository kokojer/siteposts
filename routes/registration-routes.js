//--подключение контроллеров---------------
const {
	getSignIn,
	getSignUp,
	postSignUp,
	postSignIn,
	getUser,
	getEditUser,
	getLogout,
	addImg,
	postEditUser
} = require("../controllers/registration-controller");
//---подключение
const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const { nanoid } = require('nanoid')
const path = require('path')
//---управление мултером---------------
const multer = require('multer');

function fileFilter(req, file, cb) {
	let ext = path.extname(file.originalname).toLowerCase();
	if (ext === ".png" || ext === ".svg" || ext === ".jpg" || ext === ".jpeg") {
		cb(null, true)
		req.allowed = true;
	} else {
		cb(null, false)
		req.allowed = false;
	}

}

let storage = multer.diskStorage({

	destination: 'images/',
	filename: function (req, file, callback) {

		let fileName = nanoid();
		file.originalname = fileName + path.extname(file.originalname).toLowerCase();
		callback(null, file.originalname);
	}
});
let upload = multer({ storage: storage, fileFilter })
//--get routes--------------------------

router.get("/sign-in", getSignIn);

router.get("/sign-up", getSignUp);

router.get("/users/:username", getUser);

router.get("/users/edit/:username", getEditUser);

router.get("/logout", getLogout);

router.get("/cookies", function getCookieS(req, res) {
	console.log("Cookie " + JSON.stringify(req.cookies))
	//  console.log(getCookie("token"));

});

//--post routes--------------------------

router.post(
	"/sign-up",
	[
		check(
			"nickname",
			"nickname должен быть больше 3 и меньше 20 символов"
		).isLength({ min: 3, max: 20 }),
		check(
			"password",
			"Пароль должен быть больше 4 и меньше 10 символов"
		).isLength({ min: 4, max: 10 }),
	],
	postSignUp
);

router.post(
	"/sign-in",
	postSignIn
);

router.post("/upload", upload.single("img"), addImg);

router.post("/users/edit/:username",
	[
		check(
			"nickname",
			"Nickname должен содержать больше 3 и меньше 20 символов"
		).isLength({ min: 3, max: 20 }),
		check(
			"age",
			"Age может быть от 5 до 120"
		).custom((value, { req }) => value > 5 && value < 120),
		check(
			"country",
			"Country должен содержать больше 1 и меньше 17 символов"
		).isLength({ min: 1, max: 17 }),
		check(
			"city",
			"City должен содержать больше 1 и меньше 17 символов"
		).isLength({ min: 1, max: 17 }),
		check(
			"profession",
			"Profession должен содержать больше 1 и меньше 17 символов"
		).isLength({ min: 1, max: 17 }),
	], postEditUser);



module.exports = router;
