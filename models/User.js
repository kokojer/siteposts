const {Schema, model} = require('mongoose')


const User = new Schema({
  nickname: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  img: { type: String, default: "" },
  aboutme: { type: String },
  roles: [{ type: String, ref: "Role" }],
});

module.exports = model('User', User)
