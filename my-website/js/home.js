const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

// const BASE_URL = 'https://apimocine.vercel.app/movie/';
// const IMG_URL = 'https://apimocine.vercel.app/tv/';

let currentItem;
const currentYear = new Date().getFullYear();

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

async function fetchMoviesByYear(year, page = 1) {
  const url = year === 'all'
    ? `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
    : `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'movie' }));
}

async function fetchTVByYear(year, page = 1) {
  const url = year === 'all'
    ? `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`
    : `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&first_air_date_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'tv' }));
}

async function fetchAnimeByYear(year, page = 1) {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&first_air_date_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'tv' }));
}

async function fetchVivamaxByYear(year, page = 1) {
  const url = year === 'all'
    ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=PH&with_original_language=tl&page=${page}`
    : `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=PH&with_original_language=tl&primary_release_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.map(item => ({ ...item, media_type: 'movie' }));
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
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    if (item.adult) {
      img.style.border = '2px solid red';
      img.title = 'Adult Content';
    }
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}


// showDetails Start here -------

// function showDetails(item) {
//   currentItem = item;
//   document.getElementById('modal-title').textContent = item.title || item.name;
//   document.getElementById('modal-description').textContent = item.overview;
//   document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
//   document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
//   changeServer();
//   document.getElementById('modal').style.display = 'flex';
// }
async function showDetails(item) {
  currentItem = item;
  const type = item.media_type === "movie" ? "movie" : "tv";

  try {
    // Fetch IMDb ID and details
    const [externalRes, detailsRes, creditsRes] = await Promise.all([
      fetch(`${BASE_URL}/${type}/${item.id}/external_ids?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/${type}/${item.id}?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/${type}/${item.id}/credits?api_key=${API_KEY}`)
    ]);

    const externalData = await externalRes.json();
    const details = await detailsRes.json();
    const credits = await creditsRes.json();

    currentItem.imdb_id = externalData.imdb_id;
    currentItem.genres = details.genres || [];
    currentItem.cast = credits.cast ? credits.cast.slice(0, 5) : [];

  } catch (err) {
    console.error("Error fetching extra details:", err);
    currentItem.imdb_id = null;
    currentItem.genres = [];
    currentItem.cast = [];
  }

  // Modal content
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));

  // 🔹 Add genres and cast
  const genres = currentItem.genres.map(g => g.name).join(', ');
  const cast = currentItem.cast.map(c => c.name).join(', ');
  document.getElementById('modal-genres').textContent = `Genres: ${genres || 'N/A'}`;
  document.getElementById('modal-cast').textContent = `Cast: ${cast || 'N/A'}`;

  document.getElementById('modal').style.display = 'flex';
  changeServer();
}

// showDetails end here --------

// Server section -------

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




// --------------------------------------------------------------


function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
}

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeSearchModal();
    closeModal();
    collapseAllSections();
  }
});



// watchlist button fuction --------

function toggleWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');

  const exists = watchlist.find(
    i => i.id === currentItem.id && i.media_type === currentItem.media_type
  );

  if (exists) {
    alert("Already in your watchlist!");
    return;
  }

  watchlist.push({
    id: currentItem.id,
    title: currentItem.title || currentItem.name,
    media_type: currentItem.media_type,
    poster_path: currentItem.poster_path
  });

  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  alert("Added to watchlist!");
}

// end --------------------------------


function renderWatchlist() {
  const container = document.getElementById('watchlist-container');
  const list = JSON.parse(localStorage.getItem('watchlist') || '[]');

  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<p>Your watchlist is empty.</p>';
    return;
  }

  list.forEach(item => {
    const wrapper = document.createElement('div');

    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title;
    img.onclick = async () => {
      const type = item.media_type;
      const res = await fetch(`${BASE_URL}/${type}/${item.id}?api_key=${API_KEY}`);
      const data = await res.json();
      data.media_type = type;
      showDetails(data);
    };

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeFromWatchlist(item.id, item.media_type);

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    container.appendChild(wrapper);
  });
}

function removeFromWatchlist(id, type) {
  let list = JSON.parse(localStorage.getItem('watchlist') || '[]');
  list = list.filter(i => !(i.id === id && i.media_type === type));
  localStorage.setItem('watchlist', JSON.stringify(list));
  renderWatchlist();
}










document.addEventListener('click', function (e) {
  const allowed = [
    'movies-list', 'tvshows-list', 'anime-list', 'vivamax-list',
    'modal', 'search-modal', 'search-input',
    ...Array.from(document.querySelectorAll('.see-more-btn')).map(btn => btn.id),
    ...Array.from(document.querySelectorAll('.year-selector')).map(sel => sel.id)
  ];

  const isInside = allowed.some(id => {
    const el = document.getElementById(id);
    return el && el.contains(e.target);
  });

  if (!isInside) collapseAllSections();
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

function collapseAllSections() {
  ['movies-list', 'tvshows-list', 'anime-list', 'vivamax-list'].forEach(id => {
    const container = document.getElementById(id);
    container.classList.remove('expanded');
  });
}

async function init() {
  populateYearSelect('movie-year-select');
  populateYearSelect('tvshow-year-select');
  populateYearSelect('anime-year-select');
  populateYearSelect('vivamax-year-select');

  const movies = await fetchTrending('movie');
  const tvShows = await fetchTrending('tv');
  const anime = await fetchTrendingAnime();
  const vivamax = await fetchVivamaxByYear('all');

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-list');
  displayList(tvShows, 'tvshows-list');
  displayList(anime, 'anime-list');
  displayList(vivamax, 'vivamax-list');
}

let moviePage = 1, tvPage = 1, animePage = 1, vivamaxPage = 1;

document.getElementById('see-more-movies').addEventListener('click', async () => {
  const year = document.getElementById('movie-year-select').value;
  moviePage++;
  const more = await fetchMoviesByYear(year, moviePage);
  displayList(more, 'movies-list');
  document.getElementById('movies-list').classList.add('expanded');
});

document.getElementById('see-more-tv').addEventListener('click', async () => {
  const year = document.getElementById('tvshow-year-select').value;
  tvPage++;
  const more = await fetchTVByYear(year, tvPage);
  displayList(more, 'tvshows-list');
  document.getElementById('tvshows-list').classList.add('expanded');
});

document.getElementById('see-more-anime').addEventListener('click', async () => {
  const year = document.getElementById('anime-year-select').value;
  animePage++;
  const more = await fetchAnimeByYear(year, animePage);
  displayList(more, 'anime-list');
  document.getElementById('anime-list').classList.add('expanded');
});

document.getElementById('see-more-vivamax').addEventListener('click', async () => {
  const year = document.getElementById('vivamax-year-select').value;
  vivamaxPage++;
  const more = await fetchVivamaxByYear(year, vivamaxPage);
  displayList(more, 'vivamax-list');
  document.getElementById('vivamax-list').classList.add('expanded');
});

document.getElementById('movie-year-select').addEventListener('change', async (e) => {
  moviePage = 1;
  const movies = await fetchMoviesByYear(e.target.value);
  const container = document.getElementById('movies-list');
  container.innerHTML = '';
  displayList(movies, 'movies-list');
});

document.getElementById('tvshow-year-select').addEventListener('change', async (e) => {
  tvPage = 1;
  const tv = await fetchTVByYear(e.target.value);
  const container = document.getElementById('tvshows-list');
  container.innerHTML = '';
  displayList(tv, 'tvshows-list');
});

document.getElementById('anime-year-select').addEventListener('change', async (e) => {
  animePage = 1;
  const anime = await fetchAnimeByYear(e.target.value);
  const container = document.getElementById('anime-list');
  container.innerHTML = '';
  displayList(anime, 'anime-list');
});

document.getElementById('vivamax-year-select').addEventListener('change', async (e) => {
  vivamaxPage = 1;
  const vivamax = await fetchVivamaxByYear(e.target.value);
  const container = document.getElementById('vivamax-list');
  container.innerHTML = '';
  displayList(vivamax, 'vivamax-list');
  
  renderWatchlist();
});

init();


document.addEventListener('DOMContentLoaded', () => {
  const vmaxLink = document.querySelector('a[href="#vivamax-section"]');
  const vivamaxSection = document.getElementById('vivamax-section');

  vmaxLink.addEventListener('click', (e) => {
    e.preventDefault();

    // Reveal the section
    vivamaxSection.style.display = 'block';

    // Scroll into view smoothly
    vivamaxSection.scrollIntoView({ behavior: 'smooth' });
  });
});

