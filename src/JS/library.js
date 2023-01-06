const headerSearch = document.querySelector(".js-box");
const library = document.querySelector("#library");
const home = document.querySelector("#home");
const header = document.querySelector(".header");
const searchLabel = document.querySelector(".header__label");
import Notiflix from "notiflix";
Notiflix.Notify.init({
  position: "center-top",
  clickToClose: true,
  background: "#ff6b08",
});
const libraryCreation = e => {
  e.preventDefault();
  headerSearch.innerHTML = "";
  headerSearch.innerHTML = `<div class="js-box--padding"><button class="btn-watched btn-active" type="button">Watched</button>
        <button class="btn-queue" type="button">Queue</button></div>`;
  library.classList.add("nav-list__link--active");
  home.classList.remove("nav-list__link--active");
  header.classList.add("header--bgc");
  searchLabel.classList.add("button-hidden");
  Notiflix.Notify.info("Log in for more features!");
};

library.addEventListener("click", libraryCreation);
