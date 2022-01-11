const express = require('express');
const { getContacts } = require('../controllers/contact-controller');
const checkAuth = require("../middleware/checkAuth");
const cookieParser = require("cookie-parser");

const router = express.Router();

router.get('/contacts', cookieParser('secret key'), checkAuth(), getContacts);

module.exports = router;
