// Updated JavaScript

const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

let currentItem;
let moviePage = 1, tvPage = 1, animePage = 1;
let movieData = [], tvData = [], animeData = [];
let currentMovieIndex = 0, currentTVIndex = 0, currentAnimeIndex = 0;
const ITEMS_PER_PAGE = 20;

async function fetchTrending(type) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  const data = await res.json();
  return data.results;
}

async function fetchMoreMovies(page = 1) {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
  const data = await res.json();
  return data.results;
}

async function fetchMoreTV(page = 1) {
  const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
  const data = await res.json();
  return data.results;
}

async function fetchMoreAnime(page = 1) {
  const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&page=${page}`);
  const data = await res.json();
  return data.results;
}

function displayItems(items, containerId, startIndex = 0, count = ITEMS_PER_PAGE) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const slice = items.slice(startIndex, startIndex + count);
  slice.forEach(item => {
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
  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  changeServer();
  modal.style.display = 'flex';
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

function expandSection(section, data, indexRef, containerId, seeMoreBtnId, paginationId) {
  document.querySelector(`#${containerId}`).classList.add('expanded');
  document.querySelector(`#${paginationId}`).style.display = 'flex';
  document.querySelector(`#${seeMoreBtnId}`).style.display = 'none';
  displayItems(data, containerId, indexRef, ITEMS_PER_PAGE);
}

function setupPaginationControls(paginationId, data, indexRefName, containerId) {
  const controls = document.getElementById(paginationId);
  controls.innerHTML = '';
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.onclick = () => {
    if (window[indexRefName] >= ITEMS_PER_PAGE) {
      window[indexRefName] -= ITEMS_PER_PAGE;
      displayItems(data, containerId, window[indexRefName], ITEMS_PER_PAGE);
    }
  };
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.onclick = () => {
    if (window[indexRefName] + ITEMS_PER_PAGE < data.length) {
      window[indexRefName] += ITEMS_PER_PAGE;
      displayItems(data, containerId, window[indexRefName], ITEMS_PER_PAGE);
    }
  };
  controls.appendChild(prevBtn);
  controls.appendChild(nextBtn);
}

async function init() {
  movieData = await fetchMoreMovies();
  tvData = await fetchMoreTV();
  animeData = await fetchMoreAnime();

  displayItems(movieData, 'movies-list');
  displayItems(tvData, 'tvshows-list');
  displayItems(animeData, 'anime-list');

  document.getElementById('see-more-movies').onclick = () => {
    expandSection('movies', movieData, currentMovieIndex, 'movies-list', 'see-more-movies', 'movies-pagination');
    setupPaginationControls('movies-pagination', movieData, 'currentMovieIndex', 'movies-list');
  };

  document.getElementById('see-more-tv').onclick = () => {
    expandSection('tvshows', tvData, currentTVIndex, 'tvshows-list', 'see-more-tv', 'tv-pagination');
    setupPaginationControls('tv-pagination', tvData, 'currentTVIndex', 'tvshows-list');
  };

  document.getElementById('see-more-anime').onclick = () => {
    expandSection('anime', animeData, currentAnimeIndex, 'anime-list', 'see-more-anime', 'anime-pagination');
    setupPaginationControls('anime-pagination', animeData, 'currentAnimeIndex', 'anime-list');
  };
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('click', function (e) {
  if (!document.getElementById('modal').contains(e.target)) {
    closeModal();
  }
});
