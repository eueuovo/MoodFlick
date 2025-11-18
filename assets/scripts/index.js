//*@import "./def";*/
// @import "../def";   // 필요 없으면 삭제, 필요하면 유지

// 영화 API 연결
// ===== TMDB 설정 =====
const TMDB = {
    BEARER: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOGMxNjlkZjU3MDExMjliYTlmY2UyZGI0Y2NkOGI2ZSIsIm5iZiI6MTc2MzA0NTE5OS4wOCwic3ViIjoiNjkxNWVmNGYwMDQxOTU0NjA4YTBkZjA0Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.9D_r4JCstflEuuhrR9YqUi3077_v6E703Td7cliNKwU',
    LANG: 'ko-KR',
    REGION: 'KR',
};

// ===== sh 브랜치: 카테고리 탭 기능 추가 =====
const categoryInputs = document.querySelectorAll('input[name="categoryTab"]');
categoryInputs.forEach(input => {
    input.addEventListener('change', () => {
        const category = input.value;
        if (category === '영화') {
            loadMovies();
        }
    });
});

// 화면에 영화 불러오기
function loadMovies() {
    const xhr = new XMLHttpRequest();
    const url = `https://api.themoviedb.org/3/discover/movie?language=${TMDB.LANG}&region=${TMDB.REGION}&sort_by=popularity.desc`;

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Authorization", "Bearer " + TMDB.BEARER);

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status < 200 || xhr.status >= 400) {
            console.error("TMDB 오류:", xhr.responseText);
            return;
        }

        const data = JSON.parse(xhr.responseText);
        renderMovies(data.results);
    };

    xhr.send();
}

// 영화 렌더링
function renderMovies(results) {
    const list = document.querySelector('#poster-container .list');
    list.innerHTML = '';

    const frag = document.createDocumentFragment();

    results.forEach(m => {
        const cardData = {
            description: m.overview
                ? m.overview.substring(0, 70) + '...'
                : '영화 설명이 없습니다',
            image: m.poster_path
                ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                : 'assets/images/no-poster.png',
            title: m.title || m.name,
            subtitle: m.release_date || '',
            score: Math.round(m.vote_average * 10),
            scoreUnit: '%',
        };
        frag.appendChild(createCardElement(cardData, 'movie'));
    });

    list.appendChild(frag);
}

// 도서 렌더링
function renderBooks(items) {
    const list = document.querySelector('#poster-container .list');
    list.innerHTML = '';
    const frag = document.createDocumentFragment();

    items.forEach(b => {
        const cardData = {
            image: b.cover || 'assets/images/no-poster.png',
            title: b.title,
            subtitle: `${b.author || ''} · ${b.pubDate || ''}`,
            score: b.userRating ?? '★',
            scoreUnit: '',
        };
        frag.appendChild(createCardElement(cardData, 'book'));
    });

    list.appendChild(frag);
}

// 음악 렌더링
function renderTracks(items) {
    const list = document.querySelector('#poster-container .list');
    list.innerHTML = '';
    const frag = document.createDocumentFragment();

    items.forEach(t => {
        const cardData = {
            image: t.cover || 'assets/images/no-poster.png',
            title: t.title,
            subtitle: `${t.artist} · ${t.album}`,
            score: t.popularity ?? '♪',
            scoreUnit: '',
        };
        frag.appendChild(createCardElement(cardData, 'music'));
    });

    list.appendChild(frag);
}

// 카드 요소 만들기
function createCardElement(data, type) {
    const li = document.createElement('li');
    li.classList.add('item');

    const card = document.createElement('article');
    card.classList.add('card', `card--${type}`);

    const posterWrap = document.createElement('div');
    posterWrap.classList.add('card_poster');

    const img = document.createElement('img');
    img.src = data.image;
    img.alt = data.title || '';

    const likeLabel = document.createElement('label');
    likeLabel.classList.add('card_like-label');

    // HEAD 스타일 유지
    const like = document.createElement('input');
    like.type = 'checkbox';
    like.classList.add('card_like');

    const likeIcon = document.createElement('span');
    likeIcon.classList.add('card_like-icon');
    likeIcon.innerText = '★'; // sh 버전의 아이콘 표시 추가

    likeLabel.appendChild(like);
    likeLabel.appendChild(likeIcon);

    posterWrap.appendChild(img);
    posterWrap.appendChild(likeLabel);

    const bottom = document.createElement('div');
    bottom.classList.add('card_bottom');

    const score = document.createElement('div');
    score.classList.add('card_score');

    const scoreNum = document.createElement('span');
    scoreNum.classList.add('card_score-num');
    scoreNum.textContent = data.score ?? '–';

    const scoreUnit = document.createElement('span');
    scoreUnit.classList.add('card_score-unit');
    scoreUnit.textContent = data.scoreUnit ?? '%';

    score.appendChild(scoreNum);
    score.appendChild(scoreUnit);

    const meta = document.createElement('div');
    meta.classList.add('card_meta');

    const title = document.createElement('p');
    title.classList.add('card_title');
    title.textContent = data.title;

    const subtitle = document.createElement('p');
    subtitle.classList.add('card_subtitle');
    subtitle.textContent = data.subtitle ?? '';

    const description = document.createElement('div');
    description.classList.add('card_description');
    description.textContent = data.description ?? '';

    meta.appendChild(title);
    meta.appendChild(subtitle);

    bottom.appendChild(score);
    bottom.appendChild(meta);

    card.appendChild(posterWrap);
    card.appendChild(bottom);
    card.appendChild(description);
    li.appendChild(card);

    return li;
}

// 기본 로딩
loadMovies();
