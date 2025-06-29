const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

const currentYear = new Date().getFullYear();
const pageCount = { movie: 1, tv: 1, anime: 1 };

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

async function fetchMoviesByYearPaged(year, page = 1) {
  const url = year === 'all'
    ? `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
    : `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'movie' }));
}

async function fetchTVByYearPaged(year, page = 1) {
  const url = year === 'all'
    ? `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`
    : `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&first_air_date_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'tv' }));
}

async function fetchAnimeByYearPaged(year, page = 1) {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&page=${page}` + (year !== 'all' ? `&first_air_date_year=${year}` : '');
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'tv' }));
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
  const type = currentItem.media_type === 'movie' ? 'movie' : 'tv';
  let embedURL = '';
  if (server === 'vidsrc.cc') {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === 'vidsrc.me') {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === 'player.videasy.net') {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }
  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeSearchModal();
    closeModal();
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

function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('show');
}

function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
  banner.onclick = () => showDetails(item);
}

async function init() {
  populateYearSelect('movie-year-select');
  populateYearSelect('tvshow-year-select');
  populateYearSelect('anime-year-select');

  const movies = await fetchMoviesByYearPaged('all', 1);
  const tvShows = await fetchTVByYearPaged('all', 1);
  const anime = await fetchAnimeByYearPaged('all', 1);

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
}

async function handleSeeMore(type) {
  const containerId = {
    movie: 'movies-list',
    tv: 'tvshows-list',
    anime: 'anime-list'
  }[type];

  const yearSelectId = {
    movie: 'movie-year-select',
    tv: 'tvshow-year-select',
    anime: 'anime-year-select'
  }[type];

  const fetchFn = {
    movie: fetchMoviesByYearPaged,
    tv: fetchTVByYearPaged,
    anime: fetchAnimeByYearPaged
  }[type];

  const year = document.getElementById(yearSelectId).value;
  const page = ++pageCount[type];
  const items = await fetchFn(year, page);

  const container = document.getElementById(containerId);
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });

  container.classList.add('expanded');
}

document.getElementById('see-more-movies').addEventListener('click', () => handleSeeMore('movie'));
document.getElementById('see-more-tv').addEventListener('click', () => handleSeeMore('tv'));
document.getElementById('see-more-anime').addEventListener('click', () => handleSeeMore('anime'));

document.getElementById('movie-year-select').addEventListener('change', async (e) => {
  pageCount.movie = 1;
  const movies = await fetchMoviesByYearPaged(e.target.value, 1);
  displayList(movies, 'movies-list');
});

document.getElementById('tvshow-year-select').addEventListener('change', async (e) => {
  pageCount.tv = 1;
  const tv = await fetchTVByYearPaged(e.target.value, 1);
  displayList(tv, 'tvshows-list');
});

document.getElementById('anime-year-select').addEventListener('change', async (e) => {
  pageCount.anime = 1;
  const anime = await fetchAnimeByYearPaged(e.target.value, 1);
  displayList(anime, 'anime-list');
});

init();
