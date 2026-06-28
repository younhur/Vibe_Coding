// TMDB API 설정
const API_KEY = "9628ada011ceabc5c1e3c658959a4b4d";
const BASE = "https://api.themoviedb.org/3/movie/popular";
const API_URL = `${BASE}?api_key=${API_KEY}&language=ko-KR&page=1`;
// 한국어 제목이 없는 영화는 영어 제목으로 대체하기 위한 보조 요청
const API_URL_EN = `${BASE}?api_key=${API_KEY}&language=en-US&page=1`;
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const NO_POSTER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">' +
      '<rect width="100%" height="100%" fill="#333"/>' +
      '<text x="50%" y="50%" fill="#888" font-size="20" text-anchor="middle" dominant-baseline="middle">No Image</text>' +
      "</svg>"
  );

const statusEl = document.getElementById("status");
const gridEl = document.getElementById("movie-grid");

async function loadPopularMovies() {
  try {
    const [resKo, resEn] = await Promise.all([
      fetch(API_URL),
      fetch(API_URL_EN),
    ]);
    if (!resKo.ok) {
      throw new Error(`HTTP ${resKo.status}`);
    }
    const dataKo = await resKo.json();
    // 영어 제목을 id -> title 맵으로 저장 (한글 제목 없을 때 fallback)
    const enTitleById = {};
    if (resEn.ok) {
      const dataEn = await resEn.json();
      (dataEn.results || []).forEach((m) => {
        enTitleById[m.id] = m.title;
      });
    }
    renderMovies(dataKo.results || [], enTitleById);
  } catch (err) {
    statusEl.textContent =
      "영화를 불러오지 못했습니다. (" + err.message + ")";
    statusEl.classList.add("error");
    console.error(err);
  }
}

function renderMovies(movies, enTitleById = {}) {
  if (!movies.length) {
    statusEl.textContent = "표시할 영화가 없습니다.";
    return;
  }

  statusEl.style.display = "none";

  gridEl.innerHTML = movies
    .map((movie) => {
      const poster = movie.poster_path
        ? IMAGE_BASE + movie.poster_path
        : NO_POSTER;
      const rating = movie.vote_average
        ? movie.vote_average.toFixed(1)
        : "-";
      const year = movie.release_date
        ? movie.release_date.slice(0, 4)
        : "";
      const title = getDisplayTitle(movie, enTitleById);

      return `
        <article class="movie-card">
          <img class="movie-card__poster" src="${poster}" alt="${escapeHtml(
        title
      )} 포스터" loading="lazy" />
          <div class="movie-card__body">
            <h3 class="movie-card__title">${escapeHtml(title)}</h3>
            <div class="movie-card__meta">
              <span class="movie-card__rating">★ ${rating}</span>
              <span>${year}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

// 표시할 제목 결정: 한국어 번역이 없으면(원어 제목 그대로면) 영어 제목으로 대체
function getDisplayTitle(movie, enTitleById) {
  const hasKorean = /[가-힣]/.test(movie.title);
  const noTranslation =
    movie.title === movie.original_title && movie.original_language !== "ko";

  if (!hasKorean && noTranslation && enTitleById[movie.id]) {
    return enTitleById[movie.id];
  }
  return movie.title;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

loadPopularMovies();
