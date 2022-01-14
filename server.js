//--обявление------------
const express = require('express'),
      mongoose = require('mongoose'),
      postRoutes = require("./routes/post-routes"),
      contactRoutes = require("./routes/contact-routes"),
      registrationRoutes = require("./routes/registration-routes");
      //-для пут запросов--- 
      methodOverride = require('method-override'),
      createPath = require('./helpers/create-path'),
      userObj = require("./helpers/userObj"),
      cookieParser = require("cookie-parser"),
      checkAuth = require("./middleware/checkAuth");

const app = express();
//---установка глобальных переменных-------------
app.set('view engine', 'ejs');
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

const PORT = 3000;
const db =
  "mongodb+srv://kokojer:gor222@cluster0.pdmse.mongodb.net/auth?retryWrites=true&w=majority";
//---подключение бд---------------
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => console.log('Connected to DB'))
  .catch((error) => console.log(error));
//---запуск сервака------------
app.listen(PORT, (error) => {
  error ? console.log(error) : console.log(`listening port ${PORT}`);
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

//---если такой страницы не существует----------------
app.use((req, res) => {
  const title = 'Error Page';
  res
    .status(404)
    .render(createPath('error'), { title });
});
