const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const postRoutes = require('./routes/post-routes');
const postApiRoutes = require('./routes/api-post-routes');
const contactRoutes = require('./routes/contact-routes');
const registrationRoutes = require("./routes/registration-routes");
const createPath = require('./helpers/create-path');
const userObj = require("./helpers/userObj");
const cookieParser = require("cookie-parser");
const checkAuth = require("./middleware/checkAuth");

const app = express();

app.set('view engine', 'ejs');
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

const PORT = 3000;
const db =
  "mongodb+srv://kokojer:gor222@cluster0.pdmse.mongodb.net/auth?retryWrites=true&w=majority";

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => console.log('Connected to DB'))
  .catch((error) => console.log(error));

app.listen(PORT, (error) => {
  error ? console.log(error) : console.log(`listening port ${PORT}`);
});

app.use(express.urlencoded({ extended: false }));

app.use(express.static('styles'));
app.use(express.static("images"));

app.use(methodOverride('_method'));

app.get('/', cookieParser('secret key'),checkAuth(), (req, res) => {
  const title = 'Home';
  res.render(createPath("index"), { ...userObj(req, title) });
});

app.use(postRoutes);
app.use(contactRoutes);
app.use(registrationRoutes);
app.use(postApiRoutes);

app.use((req, res) => {
  const title = 'Error Page';
  res
    .status(404)
    .render(createPath('error'), { title });
});
