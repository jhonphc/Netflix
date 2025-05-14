const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

// Fetch trending movies with optional year filter
async function fetchTrending(type, year = 'all') {
  let url = `${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`;
  if (year !== 'all') {
    url += `&primary_release_year=${year}`; // Add year filter
  }
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

// Fetch trending anime (with year filter)
async function fetchTrendingAnime(year = 'all') {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    let url = `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`;
    if (year !== 'all') {
      url += `&primary_release_year=${year}`; // Add year filter for anime
    }
    const res = await fetch(url);
    const data = await res.json();
    const filtered = data.results.filter(item =>
      item.original_language === 'ja' && item.genre_ids.includes(16)
    );
    allResults = allResults.concat(filtered);
  }
  return allResults;
}

// Function to generate year options in the dropdowns
function populateYearSelect() {
  const yearSelects = document.querySelectorAll('.filter select');
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 2000; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelects.forEach(select => select.appendChild(option.cloneNode(true)));
  }
}

// Handle year selection change for movies
document.getElementById('movie-year-select').addEventListener('change', async (e) => {
  const selectedYear = e.target.value;
  const movies = await fetchTrending('movie', selectedYear);
  displayList(movies, 'movies-list');
});

// Handle year selection change for TV shows
document.getElementById('tvshow-year-select').addEventListener('change', async (e) => {
  const selectedYear = e.target.value;
  const tvShows = await fetchTrending('tv', selectedYear);
  displayList(tvShows, 'tvshows-list');
});

// Handle year selection change for anime
document.getElementById('anime-year-select').addEventListener('change', async (e) => {
  const selectedYear = e.target.value;
  const anime = await fetchTrendingAnime(selectedYear);
  displayList(anime, 'anime-list');
});

// Display banner
function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
}

// Display list of items (movies, tv shows, or anime)
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item
