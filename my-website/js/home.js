const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

// Fetch trending movies with a year filter (if available)
async function fetchTrendingMovies(year = 'all') {
  const url = year === 'all'
    ? `${BASE_URL}/trending/movie/week?api_key=${API_KEY}` // No year filter
    : `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&sort_by=popularity.desc`; // Apply year filter

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Fetched movies:", data);  // Log the fetched movies data for debugging
    return data.results;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];  // Return empty array in case of error
  }
}

// Fetch trending TV shows with a year filter (if available)
async function fetchTrendingTVShows(year = 'all') {
  const url = year === 'all'
    ? `${BASE_URL}/trending/tv/week?api_key=${API_KEY}` // No year filter
    : `${BASE_URL}/discover/tv?api_key=${API_KEY}&primary_release_year=${year}&sort_by=popularity.desc`; // Apply year filter

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Fetched TV shows:", data);  // Log the fetched TV shows data for debugging
    return data.results;
  } catch (error) {
    console.error("Error fetching TV shows:", error);
    return [];  // Return empty array in case of error
  }
}

// Fetch trending anime (TV shows in Japanese with genre ID for anime) with a year filter (if available)
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
  document.getElementById('modal-image').src = `${IMG_URL}${item.p_
