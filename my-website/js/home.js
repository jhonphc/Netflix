const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

let pagination = {
  movie: { page: 1, year: 'all' },
  tv: { page: 1, year: 'all' },
  anime: { page: 1, year: 'all' }
};

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
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&first_air_date_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'tv' }));
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
  pagination.movie.page = 1;
  pagination.movie.year = e.target.value;
  loadPaginatedContent('movie');
});

document.getElementById('tvshow-year-select').addEventListener('change', async (e) => {
  pagination.tv.page = 1;
  pagination.tv.year = e.target.value;
  loadPaginatedContent('tv');
});

document.getElementById('anime-year-select').addEventListener('change', async (e) => {
  pagination.anime.page = 1;
  pagination.anime.year = e.target.value;
  loadPaginatedContent('anime');
});

document.getElementById('see-more-movies').addEventListener('click', () => {
  pagination.movie.page = 1;
  pagination.movie.year = document.getElementById('movie-year-select').value;
  loadPaginatedContent('movie');
});

document.getElementById('see-more-tv').addEventListener('click', () => {
  pagination.tv.page = 1;
  pagination.tv.year = document.getElementById('tvshow-year-select').value;
  loadPaginatedContent('tv');
});

document.getElementById('see-more-anime').addEventListener('click', () => {
  pagination.anime.page = 1;
  pagination.anime.year = document.getElementById('anime-year-select').value;
  loadPaginatedContent('anime');
});

async function loadPaginatedContent(type) {
  const dataMap = {
    movie: {
      fetchFn: fetchMoviesByYearPaged,
      containerId: 'movies-list',
      yearSelectId: 'movie-year-select',
      wrapper: 'see-more-movies'
    },
    tv: {
      fetchFn: fetchTVByYearPaged,
      containerId: 'tvshows-list',
      yearSelectId: 'tvshow-year-select',
      wrapper: 'see-more-tv'
    },
    anime: {
      fetchFn: fetchAnimeByYearPaged,
      containerId: 'anime-list',
      yearSelectId: 'anime-year-select',
      wrapper: 'see-more-anime'
    }
  };

  const { fetchFn, containerId, wrapper } = dataMap[type];
  const page = pagination[type].page;
  const year = pagination[type].year;

  const items = await fetchFn(year, page);
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  displayList(items, containerId);

  const btnWrapper = document.getElementById(wrapper);
  btnWrapper.innerHTML = `
    <div class="pagination-controls">
      <button onclick="prevPage('${type}')" ${page === 1 ? 'disabled' : ''}>Previous</button>
      <span>Page ${page}</span>
      <button onclick="nextPage('${type}')">Next</button>
    </div>
  `;

  container.classList.add('expanded');
}

function prevPage(type) {
  if (pagination[type].page > 1) {
    pagination[type].page--;
    loadPaginatedContent(type);
  }
}

function nextPage(type) {
  pagination[type].page++;
  loadPaginatedContent(type);
}
