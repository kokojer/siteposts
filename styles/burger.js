const iconMenu = document.querySelector(".menu__icon");
if (iconMenu) {
  const menuBody = document.querySelector(".menu__body");
  iconMenu.addEventListener("click", function (e) {
    document.body.classList.toggle("no-scroll");
    iconMenu.classList.toggle("_active");
    menuBody.classList.toggle("_active");
  });
}
