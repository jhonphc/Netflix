const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

// Fetch trending movies, apply year filter if selected
async function fetchTrendingMovies(year = 'all') {
  const url = year === 'all'
    ? `${BASE_URL}/trending/movie/week?api_key=${API_KEY}` // No year filter
    : `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&sort_by=popularity.desc`; // Apply year filter

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Fetched movies:", data.results);  // Log the results for debugging
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

// Fetch trending TV shows, apply year filter if selected
async function fetchTrendingTVShows(year = 'all') {
  const url = year === 'all'
    ? `${BASE_URL}/trending/tv/week?api_key=${API_KEY}` // No year filter
    : `${BASE_URL}/discover/tv?api_key=${API_KEY}&primary_release_year=${year}&sort_by=popularity.desc`; // Apply year filter

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Fetched TV shows:", data.results);  // Log the results for debugging
    return data.results;
  } catch (error) {
    console.error("Error fetching TV shows:", error);
    return [];
  }
}

// Fetch trending anime, apply year filter if selected
async function fetchTrendingAnime(year = 'all') {
  let allResults = [];
  for (let page = 1; page <= 3; page++) {
    let url = `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`;
    if (year !== 'all') {
      url += `&primary_release_year=${year}`; // Filter by year if provided
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      const filtered = data.results.filter(item =>
        item.original_language === 'ja' && item.genre_ids.includes(16)
      );
      allResults = allResults.concat(filtered);
      console.log("Fetched anime (page " + page + "):", filtered); // Log anime results for debugging
    } catch (error) {
      console.error("Error fetching anime:", error);
    }
  }
  return allResults;
}

// Populate year select dropdown with years (2000 to current year)
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

// Display banner with random item
function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
}

// Display list of items (movies, tv shows, or anime)
function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';  // Clear the current list
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// Show details of a selected item
function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

// Change video server
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

// Close modal
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

// Initialize page
async function init() {
  const movies = await fetchTrendingMovies();
  const tvShows = await fetchTrendingTVShows();
  const anime = await fetchTrendingAnime();

  // Check if movies, tv shows, and anime are loaded correctly
  console.log("Movies:", movies);
  console.log("TV Shows:", tvShows);
  console.log("Anime:", anime);

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');

  populateYearSelect();  // Populate year select dropdowns
}

init();

// Handle year selection change for movies
document.getElementById('movie-year-select').addEventListener('change', async (e) => {
  const selectedYear = e.target.value;
  console.log("Selected Movie Year:", selectedYear); // Log the selected year
  const movies = await fetchTrendingMovies(selectedYear);
  displayList(movies, 'movies-list');
});

// Handle year selection change for TV shows
document.getElementById('tvshow-year-select').addEventListener('change', async (e) => {
  const selectedYear = e.target.value;
  console.log("Selected TV Show Year:", selectedYear); // Log the selected year
  const tvShows = await fetchTrendingTVShows(selectedYear);
  displayList(tvShows, 'tvshows-list');
});

// Handle year selection change for anime
document.getElementById('anime-year-select').addEventListener('change', async (e) => {
  const selectedYear = e.target.value;
  console.log("Selected Anime Year:", selectedYear); // Log the selected year
  const anime = await fetchTrendingAnime(selectedYear);
  displayList(anime, 'anime-list');
});
