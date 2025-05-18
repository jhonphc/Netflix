const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

const currentYear = new Date().getFullYear();
const startYear = 2000;


//Temporary change code for filter placeholder below
/*function populateYearSelect(selectId) {
  const select = document.getElementById(selectId);
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Years';
  select.appendChild(allOption);

  for (let y = currentYear; y >= startYear; y--) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    select.appendChild(option);
  }
}*/


function populateYearSelect(selectId, minYear = 2000) {
  const select = document.getElementById(selectId);
  select.innerHTML = ''; // Clear existing options

  const allYearsOption = document.createElement('option');
  allYearsOption.value = 'all';
  allYearsOption.textContent = 'All Years';
  allYearsOption.disabled = false;
  allYearsOption.selected = true; // Make it appear as a placeholder
  select.appendChild(allYearsOption);

  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= minYear; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    select.appendChild(option);
  }
}


async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

async function fetchTrendingAnime() {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }
  return allResults;
}

async function fetchMoviesByYear(year) {
  const url = year === 'all'
    ? `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
    : `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_year=${year}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'movie' }));
}

async function fetchTVByYear(year) {
  const url = year === 'all'
    ? `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`
    : `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&first_air_date_year=${year}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'tv' }));
}

async function fetchAnimeByYear(year) {
  let allResults = [];
  for (let page = 1; page <= 2; page++) {
    const url = year === 'all'
      ? `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`
      : `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&first_air_date_year=${year}&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();
    const filtered = data.results
      .filter(item => item.original_language === 'ja' && item.genre_ids.includes(16))
      .map(item => ({ ...item, media_type: 'tv' }));
    allResults = allResults.concat(filtered);
  }
  return allResults;
}


function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('show');
}

function toggleSearchBar() {
  const searchBar = document.getElementById('search-bar');
  searchBar.classList.toggle('hidden');
  if (!searchBar.classList.contains('hidden')) {
    searchBar.focus();
  }
}


function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
  
  banner.onclick = () => showDetails(item);
}


function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = "";

  if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === "vidsrc.me") {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === "player.videasy.net") {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }

  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

// function openSearchModal() {
//   document.getElementById('search-modal').style.display = 'flex';
//   document.getElementById('search-input').focus();
// }

// function closeSearchModal() {
//   document.getElementById('search-modal').style.display = 'none';
//   document.getElementById('search-results').innerHTML = '';
// }

// search modal start
// ESC key closes modal
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeSearchModal();
  }
});

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();

  //Hide mobile navbar if open
  // const navLinks = document.querySelector('.nav-links');
  // if (navLinks.classList.contains('open')) {
  //   navLinks.classList.remove('open');
  // }

}

document.getElementById('hamburger').addEventListener('click', function () {
  document.querySelector('.nav-links').classList.toggle('open');
});

document.getElementById('search-input').addEventListener('input', () => {
  const navLinks = document.querySelector('.nav-links');
  if (window.innerWidth <= 768 && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
  }
});



function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

// search modal end

async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
  const data = await res.json();

  const container = document.getElementById('search-results');
  container.innerHTML = '';
  data.results.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => {
      closeSearchModal();
      showDetails(item);
    };
    container.appendChild(img);
  });
}

async function init() {
  populateYearSelect('movie-year-select');
  populateYearSelect('tvshow-year-select');
  populateYearSelect('anime-year-select');

  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
}

document.getElementById('movie-year-select').addEventListener('change', async (e) => {
  const movies = await fetchMoviesByYear(e.target.value);
  displayList(movies, 'movies-list');
});

document.getElementById('tvshow-year-select').addEventListener('change', async (e) => {
  const tv = await fetchTVByYear(e.target.value);
  displayList(tv, 'tvshows-list');
});

document.getElementById('anime-year-select').addEventListener('change', async (e) => {
  const anime = await fetchAnimeByYear(e.target.value);
  displayList(anime, 'anime-list');
});

init();

populateYearSelect('movie-year-select');
populateYearSelect('tvshow-year-select');
populateYearSelect('anime-year-select');
