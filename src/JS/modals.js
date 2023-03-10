import { galleryGrid, API_KEY } from "./main";
import { addMovie, getMovie } from "./storage";
import Notiflix from "notiflix";
import { renderLoader } from "./loader";
const modal = document.querySelector(".modal-backdrop");
import { renderLoader } from "./loader";
import error404 from "../images/404.png";

const modalImage = document.querySelector(".film-modal-poster-img");
const modalTitle = document.querySelector(".film-modal-title");
const modalVote = document.querySelector(".film-modal-item-vote");
const modalVotes = document.querySelector(".film-modal-item-votes");
const modalPopularity = document.querySelector(".film-modal-item-popularity");
const modalOriginalTitle = document.querySelector(
  ".film-modal-item-original-title"
);
const btnWatch = document.querySelector(`.film-modal-btn[data-type="watch"]`);
const btnQueue = document.querySelector(`.film-modal-btn[data-type="queue"]`);
const modalGenre = document.querySelector(".film-modal-item-genre");
const modalAbout = document.querySelector(".film-modal-description");
const modalContainer = document.querySelector(".film-modal");

const modalPosterWrapper = document.querySelector(".film-modal-poster-wrap");
const modalInfoWrapper = document.querySelector(".film-modal-info-wrap");

let movie = [];

const modalListner = event => {
  event.preventDefault();
  const {
    dataset: { type },
  } = event.target;

  if (type === "watch") {
    addMovie("all", movie[0]);
    event.target.textContent = "Added to watch list";
    return addMovie(type, movie[0]);
  }
  if (type === "queue") {
    addMovie("all", movie[0]);
    event.target.textContent = "Added to queue list";
    return addMovie(type, movie[0]);
  }
  if (type === "close") {
    modal.classList.add("is-hidden");
    modal.removeEventListener("click", modalListner);
    window.removeEventListener("keydown", closeModal);
    galleryGrid.addEventListener("click", openmodal);
  }
  if (event.target === modal) {
    modal.classList.add("is-hidden");
    modal.removeEventListener("click", modalListner);
    window.removeEventListener("keydown", closeModal);
    galleryGrid.addEventListener("click", openmodal);
  }
};

const closeModal = event => {
  const {
    dataset: { type },
  } = event.target;

  if (event.key === "Escape") {
    modal.classList.add("is-hidden");
    modal.removeEventListener("click", modalListner);
    window.removeEventListener("keydown", modalListner);
    galleryGrid.addEventListener("click", openmodal);
  }
};
const openmodal = async event => {
  try {
    event.preventDefault();
    const {
      nodeName,
      dataset: { id },
    } = event.target;
    const modal = document.querySelector(".modal-backdrop");
    if (nodeName !== "IMG") return;
    const errorImg = `<img alt="error 404" class="empty" src="${error404}"/>`;

    modal.classList.remove("is-hidden");

    galleryGrid.removeEventListener("click", openmodal);

    modal.addEventListener("click", modalListner);
    window.addEventListener("keydown", closeModal);
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
    );

    modalPosterWrapper.classList.remove("hide");
    modalInfoWrapper.classList.remove("hide");
    [...modalContainer.children].forEach(e => {
      if (e.classList.contains("empty")) {
        e.remove();
      }
    });

    if (!response.ok) {
      modalContainer.insertAdjacentHTML("beforeend", errorImg);
      modalPosterWrapper.classList.add("hide");
      modalInfoWrapper.classList.add("hide");
      throw new Error(response.status);
    }
    const data = await response.json();

    modalTitle.textContent = data.title;
    modalAbout.textContent = data.overview;
    modalImage.src = event.target.src;
    modalVote.textContent = data.vote_average;
    modalVotes.textContent = data.vote_count;
    modalPopularity.textContent = data.popularity;
    modalOriginalTitle.textContent = data.original_title;

    const movieGenres = data.genres.map(function (item) {
      return item["name"];
    });
    modalGenre.textContent = movieGenres.join(", ");

    movie = [];
    movie.push(data);

    const isMovieInWatchLibrary = getMovie("watch").filter(
      m => m.id === movie[0].id
    );
    const isMovieInQueueLibrary = getMovie("queue").filter(
      m => m.id === movie[0].id
    );
    if (isMovieInWatchLibrary[0]) {
      btnWatch.textContent = "Added to watch list";
    }
    if (isMovieInQueueLibrary[0]) {
      btnQueue.textContent = "Added to queue list";
    } else {
      btnWatch.textContent = "add to watch";
      btnQueue.textContent = "add to queue";
    }

    modal.addEventListener("click", modalListner);
    window.addEventListener("keydown", closeModal);
  } catch (error) {
    Notiflix.Notify.warning("Sorry, Something get wrong. Please try again");
    console.error(error);
  }
};

export { openmodal };
