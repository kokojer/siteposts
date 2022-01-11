const express = require('express');
const checkAuth = require("../middleware/checkAuth");
const cookieParser = require("cookie-parser");
const {
	getPost,
	deletePost,
	getEditPost,
	editPost,
	getPosts,
	getAddPost,
	addPost
} = require('../controllers/post-controller');

const router = express.Router();

router.get('/posts/:id', cookieParser('secret key'), checkAuth(), getPost);
router.delete('/posts/:id', deletePost);
router.get('/edit/:id', cookieParser('secret key'), checkAuth(), getEditPost);
router.put('/edit/:id', editPost);
router.get('/posts', cookieParser('secret key'), checkAuth(), getPosts);
router.get('/add-post', cookieParser('secret key'), checkAuth(), getAddPost);
router.post('/add-post', addPost);

module.exports = router;
