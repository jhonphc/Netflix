const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

const currentYear = new Date().getFullYear();
let moviePage = 1, tvPage = 1, animePage = 1;

function populateYearSelect(selectId, minYear = 2000) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="all">All Years</option>';
  for (let y = currentYear; y >= minYear; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    select.appendChild(opt);
  }
}

async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

async function fetchTrendingAnime() {
  let results = [];
  for (let p = 1; p <= 3; p++) {
    const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${p}`);
    const data = await res.json();
    results.push(...data.results.filter(i => i.original_language === 'ja' && i.genre_ids.includes(16)));
  }
  return results;
}

async function fetchByYear(type, year) {
  const isAll = year === 'all';
  const url = isAll
    ? `${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`
    : `${BASE_URL}/discover/${type}?api_key=${API_KEY}&sort_by=popularity.desc&${type === 'movie' ? 'primary_release_year' : 'first_air_date_year'}=${year}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: type }));
}

async function fetchMore(type, page) {
  const endpoint = type === 'anime'
    ? `discover/tv?with_original_language=ja&with_genres=16`
    : `${type}/popular`;
  const res = await fetch(`${BASE_URL}/${endpoint}?api_key=${API_KEY}&page=${page}`);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: type === 'anime' ? 'tv' : type }));
}

function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('show');
}

function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
  document.getElementById('banner').onclick = () => showDetails(item);
}

function displayList(items, containerId, page = 1) {
  const container = document.getElementById(containerId);
  if (!container.classList.contains('expanded')) container.innerHTML = '';

  const pageItems = items.slice((page - 1) * 20, page * 20);
  pageItems.forEach(item => {
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

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

// SEARCH
function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSearchModal();
    closeModal();
  }
});

async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) return (document.getElementById('search-results').innerHTML = '');

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

// SEE MORE logic
function setupSeeMore(buttonId, listId, type) {
  let page = 1;
  let fullList = [];

  document.getElementById(buttonId).addEventListener('click', async () => {
    const container = document.getElementById(listId);
    if (!container.classList.contains('expanded')) {
      container.classList.add('expanded');
      page = 1;
      if (fullList.length === 0) {
        fullList = await fetchMore(type, page);
      }
      displayList(fullList, listId, page);

      // Hide See More Button
      document.getElementById(buttonId).style.display = 'none';

      // Add pagination controls
      const controls = document.createElement('div');
      controls.className = 'pagination-controls';
      controls.innerHTML = `
        <button id="${listId}-prev">Previous</button>
        <button id="${listId}-next">Next</button>
      `;
      container.parentElement.appendChild(controls);

      document.getElementById(`${listId}-prev`).addEventListener('click', () => {
        if (page > 1) {
          page--;
          displayList(fullList, listId, page);
        }
      });

      document.getElementById(`${listId}-next`).addEventListener('click', async () => {
        page++;
        const more = await fetchMore(type, page);
        fullList = fullList.concat(more);
        displayList(fullList, listId, page);
      });
    }
  });

  // Collapse on outside click
  document.addEventListener('click', e => {
    const container = document.getElementById(listId);
    if (
      container.classList.contains('expanded') &&
      !container.contains(e.target) &&
      !e.target.closest('.pagination-controls') &&
      !e.target.matches(`#${buttonId}`)
    ) {
      container.classList.remove('expanded');
      container.innerHTML = '';
      document.getElementById(buttonId).style.display = 'block';
      const controls = container.parentElement.querySelector('.pagination-controls');
      if (controls) controls.remove();
    }
  });
}

// INIT
async function init() {
  populateYearSelect('movie-year-select');
  populateYearSelect('tvshow-year-select');
  populateYearSelect('anime-year-select');

  const movies = await fetchTrending('movie');
  const tv = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-list');
  displayList(tv, 'tvshows-list');
  displayList(anime, 'anime-list');
}

document.getElementById('movie-year-select').addEventListener('change', async e => {
  const list = await fetchByYear('movie', e.target.value);
  displayList(list, 'movies-list');
});

document.getElementById('tvshow-year-select').addEventListener('change', async e => {
  const list = await fetchByYear('tv', e.target.value);
  displayList(list, 'tvshows-list');
});

document.getElementById('anime-year-select').addEventListener('change', async e => {
  const list = await fetchByYear('tv', e.target.value);
  const filtered = list.filter(i => i.original_language === 'ja' && i.genre_ids.includes(16));
  displayList(filtered, 'anime-list');
});

init();

// Setup see more for all sections
setupSeeMore('see-more-movies', 'movies-list', 'movie');
setupSeeMore('see-more-tv', 'tvshows-list', 'tv');
setupSeeMore('see-more-anime', 'anime-list', 'anime');
