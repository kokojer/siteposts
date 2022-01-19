//---подключение моделей данных--------
const User = require("../models/User");
const Role = require("../models/Role");
//---подключение валидации инпутов--------
const { validationResult } = require("express-validator");
const createPath = require("../helpers/create-path");
const path = require("path");
const fs = require("fs");
const url = require("url");
//---для защиты данных--------
const jwt = require("jsonwebtoken");
const secret = "lololo";
//---объект в хедере--------
const userObj = require("../helpers/userObj");
var EasyYandexS3 = require("easy-yandex-s3");

var s3 = new EasyYandexS3({
  auth: {
    accessKeyId: "5bKSjXQ9M1DKv8w60lb-",
    secretAccessKey: "Xpd6PX2qow3egavSds__0O0TWwhm7xUYPeDqz8u1",
  },
  Bucket: "kokojer", // например, "my-storage",
  debug: true, // Дебаг в консоли, потом можете удалить в релизе
});
const uploadImg = async (filename) => {

  var upload = await s3.Upload(
    {
      path: path.resolve(__dirname, `../images/${filename}`),
    },
    "/images/"
  );
    return upload.Location;
}
const removeImg = async (filename) => {
  return await s3.Remove(`images/${filename}`);
}




const handleError = (res, error) => {
  console.log(error);
  res.render(createPath("error"), {
    title: "Error",
  });
};

const getUser = async (req, res) => {
  const title = req.params.username;
  const obj = await userObj(req, title);
  try {
    const title = req.params.username;
    let thisIsMe = false;
    const user = await User.findOne({
      username: title,
    });
    if (!user) {
      return res.render(createPath("error"), {
        title,
      });
    }

    if (req.cookies.username === req.params.username) {
      thisIsMe = true;
      return res.render(createPath("userPage"), {
        ...obj,
        thisIsMe,
        profileaboutme: user.aboutme,
        profileusername: user.username,
        profilenickname: user.nickname,
        profileuserImg: user.img || "/anonymous.jpg",
        profileage: user.age || "Empty",
        profilesex: user.sex || "Empty",
        profileprofession: user.profession || "Empty",
        profilecountry: user.country || "Empty",
        profilecity: user.city || "Empty",
      });
    } else {
      return res.render(createPath("userPage"), {
        ...obj,
        thisIsMe,
        profileaboutme: user.aboutme,
        profileusername: user.username,
        profilenickname: user.nickname,
        profileuserImg: user.img || "/anonymous.jpg",
        profileage: user.age || "Empty",
        profilesex: user.sex || "Empty",
        profileprofession: user.profession || "Empty",
        profilecountry: user.country || "Empty",
        profilecity: user.city || "Empty",
      });
    }
  } catch {
    return res.render(createPath("error"), {
      title,
    });
  }
};
const getLogout = async (req, res) => {
  return res
    .clearCookie("nickname")
    .clearCookie("username")
    .clearCookie("token")
    .clearCookie("img")
    .redirect(`/`);
};
const getEditUser = async (req, res) => {
  const title = req.params.username;
  const obj = await userObj(req, title);
  try {
    const user = req.user;

    if (!user) {
      return res.render(createPath("error"), {
        title,
      });
    } else if (user.username !== req.cookies.username) {
      return res.render(createPath("error"), {
        title,
      });
    }

    if (req.params.username !== user.username) {
      return res.render(createPath("error"), {
        title,
      });
    }
    let valid = req.query.valid;
    return res.render(createPath("userEditPage"), {
      ...obj,
      error: valid,
      profileaboutme: user.aboutme,
      profileusername: user.username,
      profilenickname: user.nickname,
      profileuserImg: req.cookies.img || user.img || "/anonymous.jpg",
      profileage: user.age,
      profilesex: user.sex,
      profileprofession: user.profession,
      profilecountry: user.country,
      profilecity: user.city,
    });
  } catch {
    return res.render(createPath("error"), {
      title,
    });
  }
};

const addImg = async (req, res) => {
  try {
    if (req.allowed === true) {
      let title = " ";
      const obj = await userObj(req, title);
      if (req.cookies.img) {
        if (obj.userImg !== req.cookies.img) {
          fs.unlink(`./images${req.cookies.img}`, function (err) {
            if (err) return console.log(err);
            console.log("file deleted successfully-repeat");
          });
          await removeImg(req.cookies.img.match(/(?<=images\/).+$/i)?.[0])
        }
      }
      let up = await uploadImg(req.file.filename) || '/anonymous.jpg'
      return res
        .cookie("img", `${up}`, {
          HttpOnly: true,
        })
        .redirect(`/users/edit/${req.cookies.username}`);
    } else {
      return res.redirect(
        url.format({
          pathname: `/users/edit/${req.cookies.username}`,
          query: {
            valid: "Допустимые форматы изображний: PNG, JPG, SVG",
          },
        })
      );
    }
  } catch (err) {
    let title = " ";
    return res.render(createPath("error"), {
      title,
    });
  }
};

const postEditUser = async (req, res) => {
  const title = req.params.username;
  try {
    let decodedData;
    try {
      decodedData = jwt.verify(req.cookies.token, secret);
    } catch (err) {
      return res
        .clearCookie("nickname")
        .clearCookie("username")
        .clearCookie("token")
        .clearCookie("img")
        .redirect(`/`);
    }
    const { nickname, age, sex, profession, city, country } = req.body;
    const img = req.cookies.img || "";
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      let error = errors.errors[0].msg;
      return res.redirect(
        url.format({
          pathname: `/users/edit/${req.cookies.username}`,
          query: {
            valid: error,
          },
        })
      );
    }

    if (req.cookies.img) {
      let userImg = await User.findOne({
        _id: decodedData.id,
      });
      if ((userImg.img !== req.cookies.img) && userImg.img) {
        fs.unlink(`./images${userImg.img}`, function (err) {
          if (err) return console.log(err);
          console.log("file deleted successfully");
        });
        await removeImg(userImg.img.match(/(?<=images\/).+$/i)?.[0]);
      }
    }
    User.findByIdAndUpdate(decodedData.id, {
      nickname,
      age,
      sex,
      profession,
      city,
      country,
      img,
    })
      .then((result) => {
        return res
          .cookie("nickname", `${nickname}`, {
            HttpOnly: true,
          })
          .redirect(`/users/${req.cookies.username}`);
      })
      .catch((error) => handleError(res, error));
  } catch (error) {
    console.log(error);
    return res.render(createPath("error"), {
      title,
    });
  }
};

module.exports = {
  getUser,
  getEditUser,
  getLogout,
  addImg,
  postEditUser,
};
