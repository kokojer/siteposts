const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
	text: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	author: {
		type: Object,
		ref: "User",
		required: true,
	}
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
