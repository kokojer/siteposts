//--обявление------------
const express = require('express'),
      mongoose = require('mongoose'),
      postRoutes = require("./routes/post-routes"),
      contactRoutes = require("./routes/contact-routes"),
      registrationRoutes = require("./routes/registration-routes");
      lkRoutes = require("./routes/lk-routes");
      //-для пут запросов--- 
      methodOverride = require('method-override'),
      createPath = require('./helpers/create-path'),
      userObj = require("./helpers/userObj"),
      cookieParser = require("cookie-parser"),
      checkAuth = require("./middleware/checkAuth");
      require('dotenv').config()

const app = express();
//---установка глобальных переменных-------------
app.set('view engine', 'ejs');
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);


//---подключение бд---------------
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => console.log('Connected to DB'))
  .catch((error) => console.log(error));
//---запуск сервака------------
app.listen(process.env.PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`listening port ${process.env.PORT}`);
});
//--установка миддл варов-------------------
app.use(express.urlencoded({ extended: false }));
app.use(express.static('styles'));
app.use(express.static("images"));
app.use(methodOverride('_method'));
app.use(cookieParser("secret key"));
app.use(checkAuth());



//--гет запрос для главной страницы-------------
app.get('/', async (req, res) => {
  const title = 'Home';
  const obj = await userObj(req, title);
  res.render(createPath("index"), { ...obj });
});

//-----подключение роутов------------------
app.use(postRoutes);
app.use(contactRoutes);
app.use(registrationRoutes);
app.use(lkRoutes);

//---если такой страницы не существует----------------
app.use((req, res) => {
  const title = 'Error Page';
  res
    .status(404)
    .render(createPath('error'), { title });
});
