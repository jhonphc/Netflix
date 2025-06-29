const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

const currentYear = new Date().getFullYear();

function populateYearSelect(selectId, minYear = 2000) {
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  const allYearsOption = document.createElement('option');
  allYearsOption.value = 'all';
  allYearsOption.textContent = 'All Years';
  allYearsOption.selected = true;
  select.appendChild(allYearsOption);

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

async function fetchMoviesByYear(year, page = 1) {
  const url = year === 'all'
    ? `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
    : `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'movie' }));
}

async function fetchTVByYear(year, page = 1) {
  const url = year === 'all'
    ? `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`
    : `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&first_air_date_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'tv' }));
}

async function fetchAnimeByYear(year, page = 1) {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&first_air_date_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'tv' }));
}

async function fetchVivamaxByYear(year, page = 1) {
  const url = year === 'all'
    ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=PH&with_original_language=tl&page=${page}`
    : `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=PH&with_original_language=tl&primary_release_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'movie' }));
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

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeSearchModal();
    closeModal();
    collapseAllSections();
  }
});

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

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

function collapseAllSections() {
  ['movies-list', 'tvshows-list', 'anime-list', 'vivamax-list'].forEach(id => {
    const container = document.getElementById(id);
    container.classList.remove('expanded');
  });
}

async function init() {
  populateYearSelect('movie-year-select');
  populateYearSelect('tvshow-year-select');
  populateYearSelect('anime-year-select');
  populateYearSelect('vivamax-year-select');

  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();
  const vivamax = await fetchVivamaxByYear('all');

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
  displayList(vivamax, 'vivamax-list');
}

let moviePage = 1;
let tvPage = 1;
let animePage = 1;
let vivamaxPage = 1;

document.getElementById('see-more-movies').addEventListener('click', async () => {
  const year = document.getElementById('movie-year-select').value;
  moviePage++;
  const more = await fetchMoviesByYear(year, moviePage);
  displayList(more, 'movies-list');
  document.getElementById('movies-list').classList.add('expanded');
});

document.getElementById('see-more-tv').addEventListener('click', async () => {
  const year = document.getElementById('tvshow-year-select').value;
  tvPage++;
  const more = await fetchTVByYear(year, tvPage);
  displayList(more, 'tvshows-list');
  document.getElementById('tvshows-list').classList.add('expanded');
});

document.getElementById('see-more-anime').addEventListener('click', async () => {
  const year = document.getElementById('anime-year-select').value;
  animePage++;
  const more = await fetchAnimeByYear(year, animePage);
  displayList(more, 'anime-list');
  document.getElementById('anime-list').classList.add('expanded');
});

document.getElementById('see-more-vivamax').addEventListener('click', async () => {
  const year = document.getElementById('vivamax-year-select').value;
  vivamaxPage++;
  const more = await fetchVivamaxByYear(year, vivamaxPage);
  displayList(more, 'vivamax-list');
  document.getElementById('vivamax-list').classList.add('expanded');
});

document.getElementById('movie-year-select').addEventListener('change', async (e) => {
  moviePage = 1;
  const movies = await fetchMoviesByYear(e.target.value);
  const container = document.getElementById('movies-list');
  container.innerHTML = '';
  displayList(movies, 'movies-list');
});

document.getElementById('tvshow-year-select').addEventListener('change', async (e) => {
  tvPage = 1;
  const tv = await fetchTVByYear(e.target.value);
  const container = document.getElementById('tvshows-list');
  container.innerHTML = '';
  displayList(tv, 'tvshows-list');
});

document.getElementById('anime-year-select').addEventListener('change', async (e) => {
  animePage = 1;
  const anime = await fetchAnimeByYear(e.target.value);
  const container = document.getElementById('anime-list');
  container.innerHTML = '';
  displayList(anime, 'anime-list');
});

document.getElementById('vivamax-year-select').addEventListener('change', async (e) => {
  vivamaxPage = 1;
  const vivamax = await fetchVivamaxByYear(e.target.value);
  const container = document.getElementById('vivamax-list');
  container.innerHTML = '';
  displayList(vivamax, 'vivamax-list');
});

init();
