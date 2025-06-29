const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
let currentItem;

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

// ESC key closes modals
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeSearchModal();
    closeModal();
  }
});

function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('show');
}

let moviePage = 1;
let tvPage = 1;
let animePage = 1;

async function fetchAllPages(type, year, maxPages = 5) {
  let allResults = [];

  for (let page = 1; page <= maxPages; page++) {
    let url;

    if (type === 'movie') {
      url = year === 'all'
        ? `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
        : `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_year=${year}&page=${page}`;
    } else if (type === 'tv') {
      url = year === 'all'
        ? `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`
        : `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&first_air_date_year=${year}&page=${page}`;
    } else if (type === 'anime') {
      url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&page=${page}`;
      if (year !== 'all') {
        url += `&first_air_date_year=${year}`;
      }
    }

    const res = await fetch(url);
    const data = await res.json();
    const items = data.results.map(item => ({ ...item, media_type: type }));
    allResults = allResults.concat(items);
  }

  return allResults;
}

document.getElementById('see-more-movies').addEventListener('click', async () => {
  const year = document.getElementById('movie-year-select').value;
  const items = await fetchAllPages('movie', year, 5);
  const container = document.getElementById('movies-list');
  container.classList.add('vertical');
  displayList(items, 'movies-list');
  document.getElementById('see-more-movies').style.display = 'none';
});

document.getElementById('see-more-tv').addEventListener('click', async () => {
  const year = document.getElementById('tvshow-year-select').value;
  const items = await fetchAllPages('tv', year, 5);
  const container = document.getElementById('tvshows-list');
  container.classList.add('vertical');
  displayList(items, 'tvshows-list');
  document.getElementById('see-more-tv').style.display = 'none';
});

document.getElementById('see-more-anime').addEventListener('click', async () => {
  const year = document.getElementById('anime-year-select').value;
  const items = await fetchAllPages('anime', year, 5);
  const container = document.getElementById('anime-list');
  container.classList.add('vertical');
  displayList(items, 'anime-list');
  document.getElementById('see-more-anime').style.display = 'none';
});

async function init() {
  populateYearSelect('movie-year-select');
  populateYearSelect('tvshow-year-select');
  populateYearSelect('anime-year-select');

  const movies = await fetchAllPages('movie', 'all', 1);
  const tvShows = await fetchAllPages('tv', 'all', 1);
  const anime = await fetchAllPages('anime', 'all', 1);

  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');

  const bannerMovie = movies[Math.floor(Math.random() * movies.length)];
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${bannerMovie.backdrop_path})`;
  document.getElementById('banner-title').textContent = bannerMovie.title || bannerMovie.name;
  banner.onclick = () => showDetails(bannerMovie);
}

init();
