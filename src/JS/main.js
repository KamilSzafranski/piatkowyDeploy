import nocover from "../images/nocover.png";
import { openmodal } from "./modals";
import { getMovie } from "./storage";
import empty from "../images/empty_library.png";
import emptyWatch from "../images/empty_watched.png";
import emptyQueue from "../images/empty_queue.png";
import nothing from "../images/nothing3.png";
import Notiflix from "notiflix";
import nothing2 from "../images/nothing2.png";
import nothing2 from "../images/nothing2.png";
import { removeButton } from "./library";

const GALLERY = document.querySelector("ul.MainPage__Grid");
const GALLERY_TEMPLATE = document.querySelector("template.GalleryTemplate");
const NUMBEF_OF_PHOTO = 20;
const API_KEY = "40ed737db1bcf2c75f234fa073fa8cf6";
const galleryGrid = document.querySelector("ul.MainPage__Grid");
const SEARCH_INPUT = document.querySelector("input.header__input");
const SEARCH_BTN = document.querySelector("button.header__submit");
const PAGINATION_CONTAINER = document.querySelector("div.Pagination");
const PAGINATION_CONTAINER_GRID = document.querySelector(
  "div.Pagination__containerGrid"
);
const PAGINATION_GRID = document.querySelector("ul.Pagination__grid");
const additionalItems = [
  ...document.querySelectorAll(".Pagination__additionalItem"),
];

let searchMovieOption = {
  api_key: API_KEY,
  language: "en-US",
};
let mode;
let totalResults;
let totalPages;
let currentPage = 1;
let results;
let currentLibraryPage = 1;
let libraryMode;

let firstItem = document.querySelector("div[data-add='first']");
let lastItem = document.querySelector("div[data-add='last']");

const createTemplateGallery = number => {
  for (let i = 0; i < number; i++) {
    GALLERY.append(GALLERY_TEMPLATE.content.cloneNode(true));
  }
};

const additionalItemsVisibility = (type, visible, opacity) => {
  return additionalItems.forEach(element => {
    if (element.dataset.item === type) {
      element.style.visibility = visible;
      element.style.opacity = opacity;
    }
  });
};

const createPaginationList = numberOfPage => {
  const media = window.matchMedia("(max-width: 600px)");

  PAGINATION_GRID.innerHTML = "";
  PAGINATION_CONTAINER.style.display = "flex";
  const paginationGridFragment = document.createDocumentFragment();
  for (let k = 0; k < numberOfPage; k++) {
    const paginationGridItem = document.createElement("li");
    paginationGridItem.classList.add("Pagination__item");
    paginationGridItem.textContent = k + 1;
    paginationGridFragment.append(paginationGridItem);
  }

  PAGINATION_GRID.append(paginationGridFragment);

  let pagiantionItemActived = document.querySelector(
    `.Pagination__item:nth-child(${currentPage})`
  );

  pagiantionItemActived.classList.add("Pagination__item--active");

  if (totalPages < 5) {
    PAGINATION_CONTAINER_GRID.style.width = `${
      totalPages * 22 + (totalPages - 1) * 18 + 18
    }px`;
    move(0);
  } else {
    PAGINATION_CONTAINER_GRID.style.width = "200px";
    lastItem.textContent = totalPages;
    additionalItemsVisibility("right", "visible", "1");
    PAGINATION_CONTAINER.lastElementChild.style.transform = `translateX(0px)`;
  }

  if (totalPages - currentPage <= 3) {
    additionalItemsVisibility("right", "hidden", "0");
    PAGINATION_CONTAINER.lastElementChild.style.transform = `translateX(-80px)`;
  }
  if (currentPage > 3) {
    PAGINATION_CONTAINER.firstElementChild.style.transform = `translateX(0px)`;
    additionalItemsVisibility("left", "visible", "1");
  } else {
    additionalItemsVisibility("left", "hidden", "0");
    PAGINATION_CONTAINER.firstElementChild.style.transform = `translateX(80px)`;
  }
  if (currentPage === 1) {
    PAGINATION_CONTAINER.firstElementChild.style.visibility = "hidden";
    PAGINATION_CONTAINER.firstElementChild.style.opacity = "0";
  } else {
    PAGINATION_CONTAINER.firstElementChild.style.visibility = "visible";
    PAGINATION_CONTAINER.firstElementChild.style.opacity = "1";
  }
  if (currentPage === totalPages) {
    PAGINATION_CONTAINER.lastElementChild.style.visibility = "hidden";
    PAGINATION_CONTAINER.lastElementChild.style.opacity = "0";
  } else {
    PAGINATION_CONTAINER.lastElementChild.style.visibility = "visible";
    PAGINATION_CONTAINER.lastElementChild.style.opacity = "1";
  }

  if (media.matches) {
    PAGINATION_CONTAINER.firstElementChild.style.transform = `translateX(0px)`;
    PAGINATION_CONTAINER.lastElementChild.style.transform = `translateX(0px)`;
    additionalItems.forEach(element => (element.style.display = "none"));
  }
};
const displayMovie = (Movie, Category, type = "normal") => {
  [...galleryGrid.children].forEach((element, index) => {
    if (Movie[index].status_code) {
      return;
    }
    let {
      title,
      name,
      poster_path,
      id,
      genre_ids: genreID,
      release_date: releaseDate,
      first_air_date: firstAirDate,
    } = Movie[index];
    let movieCategory;

    let poster =
      poster_path === null
        ? nocover
        : `https://image.tmdb.org/t/p/w500${poster_path}`;

    const markup = `<img class="MainPage__Img skeleton" alt="Poster of movie:${
      name || title
    }"  src="${poster}" data-id="${id}"/>`;

    const listDescendant = [...element.querySelectorAll("*")].forEach(
      listElement => {
        if (listElement.classList.contains("MainPage__Img")) {
          listElement.remove();
        }
        if (listElement.classList.contains("ImgWrapper")) {
          listElement.insertAdjacentHTML("beforeend", markup);
        }
        if (listElement.classList.contains("MainPage__PhotoTitle")) {
          listElement.classList.remove("skeleton__text");
          listElement.textContent = title || name;
        }

        if (listElement.classList.contains("MainPage__PhotoType")) {
          listElement.classList.remove("skeleton__text");
          listElement.after("|");

          if (type === "normal") {
            const movieAllCategory = genreID.flatMap(dataMovieGenreID => {
              return Category.flatMap(categoryElement =>
                dataMovieGenreID === categoryElement.id
                  ? categoryElement.name
                  : []
              );
            });

            if (movieAllCategory.length >= 4) {
              movieCategory =
                movieAllCategory.slice(0, 3).join(", ") + " " + "...";
            } else {
              movieCategory = movieAllCategory.join(", ");
            }
          }

          listElement.textContent = `${
            movieCategory === "" ? "No type in database" : movieCategory
          }`;
          if (type === "library") {
            const movieLibraryCategory = Movie[index].genres.map(e => e.name);

            if (movieLibraryCategory.length >= 4) {
              movieCategory =
                movieLibraryCategory.slice(0, 3).join(", ") + " " + "...";
            } else {
              movieCategory = movieLibraryCategory.join(", ");
            }
            listElement.textContent = `${
              movieCategory === "" ? "No type in database" : movieCategory
            }`;
          }
        }

        if (listElement.classList.contains("MainPage__PhotoYear")) {
          listElement.classList.remove("skeleton__text");

          let dateToWrite =
            (releaseDate || firstAirDate) ?? "No data in database";

          if (dateToWrite === "No data in database") {
            return (listElement.textContent = dateToWrite);
          }

          listElement.textContent = dateToWrite.slice(0, 4);
        }
      }
    );
  });
};

const getLibraryMovie = async (type, count = "first", test2) => {
  try {
    if (count === "first") {
      currentPage = 1;
    }
    mode = "library";
    galleryGrid.removeEventListener("click", openmodal);

    GALLERY.innerHTML = "";
    currentPage = test2 ?? currentPage;
    console.currentPage;

    createTemplateGallery(NUMBEF_OF_PHOTO);
    let libraryMovie;
    if (type === "watch") {
      libraryMode = "watch";
      libraryMovie = getMovie(type);
    }

    if (type === "queue") {
      libraryMode = "queue";
      libraryMovie = getMovie(type);
    }
    if (type === "all") {
      libraryMode = "all";
      libraryMovie = getMovie(type);
    }

    totalResults = libraryMovie.length;
    totalPages = Math.ceil(libraryMovie.length / 20);
    const libraryDataMovie = libraryMovie.filter((e, i) => {
      const startData = currentPage * 20 - 20;
      const endData = currentPage * 20;
      const data = i >= startData && i < endData;
      return data;
    });

    results = libraryDataMovie.length;

    if (totalResults === 0) {
      PAGINATION_CONTAINER.style.display = "none";
      galleryGrid.removeEventListener("click", openmodal);
      removeButton.disabled = true;
      removeButton.classList.add("btnRemove--disabled");
      if (type === "all") {
        galleryGrid.innerHTML = `<img class="empty" alt="empty "  src="${empty}"> `;
      }
      if (type === "watch") {
        galleryGrid.innerHTML = `<img class="empty" alt="empty "  src="${emptyWatch}"> `;
      }
      if (type === "queue") {
        galleryGrid.innerHTML = `<img class="empty" alt="empty "  src="${emptyQueue}"> `;
      }
      return totalResults;
    } else {
      if (type !== "all") {
        PAGINATION_CONTAINER.style.display = "flex";
        removeButton.disabled = false;
        removeButton.classList.remove("btnRemove--disabled");
      }
    }
    if (results < 20) {
      const removeRemainingSkeleton = [...GALLERY.children].forEach(
        (remainingElement, remainingIndex) => {
          if (remainingIndex >= results) remainingElement.remove();
        }
      );
    }

    const getSearchMovieCategory = await fetch(
      `
https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );

    if (!getSearchMovieCategory.ok) {
      throw new Error(getSearchMovieCategory.status);
    }
    const responseSearchCategory = await getSearchMovieCategory.json();
    const dataSearchCategory = responseSearchCategory.genres;

    displayMovie(libraryDataMovie, dataSearchCategory, "library");

    createPaginationList(totalPages);
    if (count === "first") {
      PAGINATION_GRID.style.transform = `translateX(0px)`;
    }
    return totalResults;
  } catch (error) {
    console.error(error.message, error.code);
  }
};

const getPopularMovie = async () => {
  try {
    createTemplateGallery(NUMBEF_OF_PHOTO);
    const getPopularMovie = await fetch(
      `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`
    );
    if (!getPopularMovie.ok) throw new Error(getPopularMovie.status);
    const responsePopularMovie = await getPopularMovie.json();
    const dataPopularMovie = responsePopularMovie.results;

    const getPopularMovieCategory = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );
    if (!getPopularMovieCategory.ok) {
      throw new Error(getPopularMovieCategory.status);
    }
    const responsePopularCategory = await getPopularMovieCategory.json();
    const dataPopularCategory = responsePopularCategory.genres;

    displayMovie(dataPopularMovie, dataPopularCategory);
    galleryGrid.addEventListener("click", openmodal);
  } catch (error) {
    console.error(error.message);
  }
};

const getSearchMovie = async (event, count = "first") => {
  try {
    if (count === "first") {
      currentPage = 1;
    }

    mode = "search";
    event.preventDefault();
    GALLERY.innerHTML = "";
    searchMovieOption.query = SEARCH_INPUT.value.trim();
    searchMovieOption.page = currentPage;
    event.currentTarget.blur();
    const params = new URLSearchParams(searchMovieOption);
    if (searchMovieOption.query === "") {
      galleryGrid.innerHTML = `<img class="empty" alt="empty "  src="${nothing2}"> `;

      return Notiflix.Notify.warning(
        "Search result not successful. Enter the correct movie name and try again."
      );
    }

    createTemplateGallery(NUMBEF_OF_PHOTO);

    const getSearchMovie = await fetch(
      `https://api.themoviedb.org/3/search/movie?${params}`
    );
    if (!getSearchMovie.ok) throw new Error(getSearchMovie.status);
    const responseSearchMovie = await getSearchMovie.json();

    totalPages = responseSearchMovie.total_pages;
    totalResults = responseSearchMovie.total_results;
    results = responseSearchMovie.results.length;

    if (count === "first" && totalResults >= 1) {
      Notiflix.Notify.success(
        `We found ${totalResults} movies matching your search!`
      );
    }

    if (totalResults === 0) {
      galleryGrid.innerHTML = `<img class="empty" alt="empty "  src="${nothing}"> `;
      PAGINATION_CONTAINER.style.display = "none";
      galleryGrid.removeEventListener("click", openmodal);
      Notiflix.Notify.warning(
        "Search result not successful. Enter the correct movie name and try again."
      );
      return;
    } else {
      PAGINATION_CONTAINER.style.display = "flex";
    }

    if (results < 20) {
      const removeRemainingSkeleton = [...GALLERY.children].forEach(
        (remainingElement, remainingIndex) => {
          if (remainingIndex >= results) remainingElement.remove();
        }
      );
    }
    const dataSearchMovie = responseSearchMovie.results;

    const getSearchMovieCategory = await fetch(
      `
https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );
    if (!getSearchMovieCategory.ok) {
      throw new Error(getSearchMovieCategory.status);
    }
    const responseSearchCategory = await getSearchMovieCategory.json();
    const dataSearchCategory = responseSearchCategory.genres;

    displayMovie(dataSearchMovie, dataSearchCategory);

    createPaginationList(totalPages);
    if (count === "first") {
      PAGINATION_GRID.style.transform = `translateX(0px)`;
    }
  } catch (error) {
    console.error(error.message, error.code);
  }
};

const pagination = event => {
  const {
    nodeName,
    textContent,
    dataset: { page },
  } = event.target;
  event.preventDefault();

  let gridTranslateX =
    PAGINATION_GRID.computedStyleMap().get("transform")[0].x.value;

  if (page === "next") {
    currentPage++;
    if (mode === "search") getSearchMovie(event, "second");
    if (mode === "library") getLibraryMovie(libraryMode, "second");
  }
  if (page == "previous") {
    currentPage--;
    if (mode === "search") getSearchMovie(event, "second");
    if (mode === "library") getLibraryMovie(libraryMode, "second");
  }

  if (page === "next" && currentPage > 3) {
    gridTranslateX -= 40;
    move(gridTranslateX);
  }
  if (page === "previous" && currentPage >= 3) {
    gridTranslateX += 40;
    move(gridTranslateX);
  }

  if (totalPages - currentPage <= 2 && page === "next") {
    gridTranslateX = -(totalPages - 5) * 40;
    move(gridTranslateX);
  }
  if (totalPages - currentPage < 2 && page == "previous") {
    {
      gridTranslateX = -(totalPages - 5) * 40;
      move(gridTranslateX);
    }
  }
  if (nodeName === "LI") {
    currentPage = Number(textContent);

    if (Number(textContent) > 3 && currentPage >= 3) {
      if (!(totalPages - Number(textContent)) < 3) {
        gridTranslateX = -(Number(textContent) - 3) * 40;
        move(gridTranslateX);
      }
    }

    if (Number(textContent) <= 3 && currentPage >= 3) {
      gridTranslateX += (3 - Number(textContent)) * 40;
      move(gridTranslateX);
    }

    if (Number(textContent) <= 3) {
      gridTranslateX = 0;
      move(gridTranslateX);
    }
    if (totalPages - Number(textContent) < 3) {
      gridTranslateX = -(totalPages - 5) * 40;
      move(gridTranslateX);
    }

    if (mode === "search") getSearchMovie(event, "second");
    if (mode === "library") getLibraryMovie(libraryMode, "second");
  }

  if (event.target === firstItem) {
    gridTranslateX = 0;
    move(gridTranslateX);
    currentPage = 1;
    if (mode === "search") getSearchMovie(event, "second");
    if (mode === "library") getLibraryMovie(libraryMode, "second");
  }

  if (event.target === lastItem) {
    gridTranslateX = -(totalPages - 5) * 40;
    move(gridTranslateX);
    currentPage = totalPages;
    if (mode === "search") getSearchMovie(event, "second");
    if (mode === "library") getLibraryMovie(libraryMode, "second");
  }
};

export {
  getPopularMovie,
  getSearchMovie,
  pagination,
  SEARCH_BTN,
  PAGINATION_CONTAINER,
  API_KEY,
  galleryGrid,
  getLibraryMovie,
};

const move = value => {
  PAGINATION_GRID.style.transform = `translateX(${value}px)`;
};
