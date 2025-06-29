const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
let currentItem;

let moviePage = 1;
let tvPage = 1;
let animePage = 1;

let movieMaxPages = 5;
let tvMaxPages = 5;
let animeMaxPages = 5;

let expandedSection = null;

// === FILTER LOGIC ===
function populateYearSelect(selectId, minYear = 2000) {
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  const allYearsOption = document.createElement('option');
  allYearsOption.value = 'all';
  allYearsOption.textContent = 'All Years';
  allYearsOption.selected = true;
  select.appendChild(allYearsOption);

  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= minYear; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    select.appendChild(option);
  }
}

// === FETCH FUNCTIONS ===
async function fetchItems(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

function buildURL(type, year, page) {
  if (year === 'all') {
    return `${BASE_URL}/${type}/popular?api_key=${API_KEY}&page=${page}`;
  } else {
    return `${BASE_URL}/discover/${type}?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_year=${year}&page=${page}`;
  }
}

// === DISPLAY FUNCTIONS ===
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

function appendItems(items, containerId) {
  const container = document.getElementById(containerId);
  items.forEach(item => {
    if (!item.poster_path) return;
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

// === MODAL SEARCH ===
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

// === SEE MORE / PAGINATION ===
async function handleSeeMore(section, type) {
  expandedSection = section;
  const listId = `${section}-list`;
  const btnId = `see-more-${section}`;
  const paginationId = `${section}-pagination`;
  const filterId = `${section}-year-select`;

  document.getElementById(listId).classList.add('expanded');
  document.getElementById(btnId).style.display = 'none';
  document.getElementById(paginationId).style.display = 'flex';

  const year = document.getElementById(filterId).value;
  let page = 1;
  let results = [];

  for (page = 1; page <= 5; page++) {
    const url = buildURL(type, year, page);
    const data = await fetchItems(url);
    results = results.concat(data.map(item => ({ ...item, media_type: type })));
  }

  displayList(results, listId);
}

function setupPagination(section, type) {
  let page = 1;
  const maxPage = 20;
  const listId = `${section}-list`;
  const filterId = `${section}-year-select`;
  const pagination = document.getElementById(`${section}-pagination`);

  const updatePage = async () => {
    const year = document.getElementById(filterId).value;
    const url = buildURL(type, year, page);
    const results = await fetchItems(url);
    displayList(results.map(item => ({ ...item, media_type: type })), listId);
  };

  pagination.querySelector('.prev').addEventListener('click', async () => {
    if (page > 1) {
      page--;
      updatePage();
    }
  });

  pagination.querySelector('.next').addEventListener('click', async () => {
    if (page < maxPage) {
      page++;
      updatePage();
    }
  });
}

// === INITIAL LOAD ===
async function init() {
  populateYearSelect('movie-year-select');
  populateYearSelect('tvshow-year-select');
  populateYearSelect('anime-year-select');

  const movieData = await fetchItems(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
  const tvData = await fetchItems(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
  const animeData = await fetchItems(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ja&with_genres=16`);

  displayList(movieData, 'movies-list');
  displayList(tvData, 'tvshows-list');
  displayList(animeData, 'anime-list');
}

document.getElementById('see-more-movies').addEventListener('click', () => handleSeeMore('movies', 'movie'));
document.getElementById('see-more-tv').addEventListener('click', () => handleSeeMore('tvshows', 'tv'));
document.getElementById('see-more-anime').addEventListener('click', () => handleSeeMore('anime', 'tv'));

setupPagination('movies', 'movie');
setupPagination('tvshows', 'tv');
setupPagination('anime', 'tv');

document.getElementById('movie-year-select').addEventListener('change', async (e) => {
  const movies = await fetchItems(buildURL('movie', e.target.value, 1));
  displayList(movies.map(item => ({ ...item, media_type: 'movie' })), 'movies-list');
});
document.getElementById('tvshow-year-select').addEventListener('change', async (e) => {
  const tv = await fetchItems(buildURL('tv', e.target.value, 1));
  displayList(tv.map(item => ({ ...item, media_type: 'tv' })), 'tvshows-list');
});
document.getElementById('anime-year-select').addEventListener('change', async (e) => {
  const anime = await fetchItems(buildURL('tv', e.target.value, 1));
  displayList(anime.map(item => ({ ...item, media_type: 'tv' })), 'anime-list');
});

init();

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeSearchModal();
    closeModal();
  }
});
