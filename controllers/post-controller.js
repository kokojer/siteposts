const Post = require('../models/post');
const createPath = require('../helpers/create-path');
const userObj = require('../helpers/userObj')
const User = require("../models/User");
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");
const secret = 'lololo';
const handleError = (res, error) => {
	console.log(error);
	res.render(createPath('error'), { title: 'Error' });
}

const getPost = async (req, res) => {

	const title = 'Post';
	const obj = await userObj(req, title);
	Post
		.findById(req.params.id)
		.then(async (post) => {

			const authorPost = await User.findOne({
				_id: post.author
			});
			let itsMe = false;
			const { username, nickname, img } = authorPost;
			if (obj.username === username) {
				itsMe = true;
			}
			let postObj = {
				itsMe,
				id: req.params.id,
				updatedAt: post.updatedAt,
				createdAt: post.createdAt,
				text: post.text,
				postTitle: post.title,
				userUsername: username,
				userNickname: nickname,
				userPostImg: img || 'https://kokojer.storage.yandexcloud.net/images/anonymous.jpg',
			}

			res.render(createPath('post'), { ...postObj, ...obj })
		})
		.catch((error) => handleError(res, error));
}

const deletePost = async (req, res) => {

	let decodedData
	try {
		decodedData = jwt.verify(req.cookies.token, secret);
	} catch (err) {
		return (res.clearCookie('nickname').clearCookie('username').clearCookie('token').clearCookie('img').redirect(`/`))
	}
	const removeblePost = await Post.findOne({
		_id: req.params.id
	});
	if (decodedData.id == removeblePost.author) {
		Post
			.findByIdAndDelete(req.params.id)
			.then((result) => {
				res.sendStatus(200);
			})
			.catch((error) => handleError(res, error));
	} else {

		return res.render(createPath("error"), {
			title: 'error'
		})
	}
}

const getEditPost = async (req, res) => {
	const title = 'Edit post';
	const obj = await userObj(req, title);
	Post
		.findById(req.params.id)
		.then(async (post) => {
			const authorPost = await User.findOne({
				_id: post.author
			});
			const { username, nickname, img } = authorPost;

			let postObj = {
				id: req.params.id,
				updatedAt: post.updatedAt,
				createdAt: post.createdAt,
				text: post.text,
				postTitle: post.title,
				userUsername: username,
				userNickname: nickname,
				userPostImg: img || 'https://kokojer.storage.yandexcloud.net/images/anonymous.jpg',
			}
			res.render(createPath('edit-post'), { ...postObj, ...obj })
		})
		.catch((error) => handleError(res, error));
}

const editPost = (req, res) => {
	const { title, text } = req.body;
	const { id } = req.params;
	Post
		.findByIdAndUpdate(id, { title, text })
		.then((result) => res.redirect(`/posts/${id}`))
		.catch((error) => handleError(res, error));
}

const getPosts = async (req, res) => {
	const title = 'Posts';
	const obj = await userObj(req, title);
	Post
		.find()
		.sort({ createdAt: -1 })
		.then(async (posts) => {
			let fullPostsInfo = await Promise.all(posts.map(async (elem) => {
				const authorPost = await User.findOne({
					_id: elem.author
				});
				let itsMe = false;
				const { username, nickname, img } = authorPost;
				if (obj.username === username) {
					itsMe = true;
				}
				return {
					itsMe,
					updatedAt: elem._doc.updatedAt,
					createdAt: elem._doc.createdAt,
					text: elem._doc.text,
					title: elem._doc.title,
					id: elem._doc._id,
					username: username,
					userNickname: nickname,
					userImg: img || 'https://kokojer.storage.yandexcloud.net/images/anonymous.jpg',
				}
			}))
			res.render(createPath('posts'), { fullPostsInfo, ...obj })
		})
		.catch((error) => handleError(res, error));
}

const getAddPost = async (req, res) => {
	const title = 'Add Post';
	const obj = await userObj(req, title);
	res.render(createPath('add-post'), {
		...obj
	});
}

const addPost = async (req, res) => {
	const { title, text } = req.body;

	const author = await User.findOne({
		username: req.cookies.username
	});
	const post = new Post({ title, author, text });
	post
		.save()
		.then((result) => res.redirect('/posts'))
		.catch((error) => handleError(res, error));
}

module.exports = {
	getPost,
	deletePost,
	getEditPost,
	editPost,
	getPosts,
	getAddPost,
	addPost,
};
