const API_KEY = 'd2d985b7df3d3be9d03874d6bb4ada88';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
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

async function fetchVivamaxByYear(year, page = 1) {
  const url = year === 'all'
    ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=PH&with_original_language=tl&include_adult=true&page=${page}`
    : `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=PH&with_original_language=tl&include_adult=true&primary_release_year=${year}&page=${page}`;
  const res = await fetch(url);
  const data = await res.json();
  const filtered = data.results.filter(item => item.adult);
  return filtered.map(item => ({ ...item, media_type: 'movie' }));
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  items.forEach(item => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);

    if (item.adult) {
      const badge = document.createElement('span');
      badge.textContent = '18+';
      badge.style.position = 'absolute';
      badge.style.top = '5px';
      badge.style.left = '5px';
      badge.style.background = 'red';
      badge.style.color = 'white';
      badge.style.fontSize = '12px';
      badge.style.padding = '2px 5px';
      badge.style.borderRadius = '3px';
      wrapper.appendChild(badge);
    }

    wrapper.appendChild(img);
    container.appendChild(wrapper);
  });
}

async function init() {
  populateYearSelect('vivamax-year-select');
  const vivamax = await fetchVivamaxByYear('all');
  displayList(vivamax, 'vivamax-list');
}

let vivamaxPage = 1;

document.getElementById('see-more-vivamax').addEventListener('click', async () => {
  const year = document.getElementById('vivamax-year-select').value;
  vivamaxPage++;
  const more = await fetchVivamaxByYear(year, vivamaxPage);
  displayList(more, 'vivamax-list');
  document.getElementById('vivamax-list').classList.add('expanded');
});

document.getElementById('vivamax-year-select').addEventListener('change', async (e) => {
  vivamaxPage = 1;
  const vivamax = await fetchVivamaxByYear(e.target.value);
  const container = document.getElementById('vivamax-list');
  container.innerHTML = '';
  displayList(vivamax, 'vivamax-list');
});

init();
