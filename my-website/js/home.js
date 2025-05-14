const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

// Fetch trending movies with an optional year filter
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

// Function to generate year options in the dropdown
function populateYearSelect() {
  const yearSelect = document.getElementById('year-select');
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 2000; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
}

// Function to handle year selection change
document.getElementById('year-select').addEventListener('change', async (e) => {
  const selectedYear = e.target.value;
  const movies = await fetchTrending('movie', selectedYear);
  const tvShows = await fetchTrending('tv', selectedYear);
  const anime = await fetchTrendingAnime(selectedYear);

  // Re-display the lists with filtered content
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
});

function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
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

async function init() {
  // Populate the year filter dropdown
  populateYearSelect();

  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
}

init();
