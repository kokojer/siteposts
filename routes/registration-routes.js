const express = require("express");
const createPath = require("../helpers/create-path");
const { check } = require("express-validator");
const checkAuth = require("../middleware/checkAuth");
const router = express.Router();
const { nanoid } = require('nanoid')
const path = require('path')

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

const cookieParser = require("cookie-parser");
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

router.get("/sign-in", cookieParser('secret key'), checkAuth(), getSignIn);

router.get("/sign-up", cookieParser("secret key"), checkAuth(), getSignUp);

router.post(
	"/sign-up",
	[
		check(
			"nickname",
			"nickname должен быть больше 4 и меньше 10 символов"
		).isLength({ min: 4, max: 10 }),
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

router.get("/users/:username", cookieParser("secret key"), checkAuth(), getUser);
router.get("/users/edit/:username", cookieParser("secret key"), checkAuth(), getEditUser);
router.get("/logout", cookieParser("secret key"), checkAuth(), getLogout);

router.post("/upload", cookieParser("secret key"), checkAuth(), upload.single("img"), addImg);

router.post("/users/edit/:username", cookieParser("secret key"), checkAuth(),
	[
		check(
			"nickname",
			"Пароль должен быть больше 4 и меньше 10 символов"
		).isLength({ min: 4, max: 20 }),
	], postEditUser);

router.get("/cookies", cookieParser('secret key'), function getCookieS(req, res) {
	console.log("Cookie " + JSON.stringify(req.cookies))
	//  console.log(getCookie("token"));

});

module.exports = router;
