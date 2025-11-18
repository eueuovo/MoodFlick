<<<<<<< HEAD
=======
// 영화 API 연결
// ===== TMDB 설정 (v4 Read Access Token만 넣으세요) =====
>>>>>>> origin/sh
const TMDB = {
    BEARER: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOGMxNjlkZjU3MDExMjliYTlmY2UyZGI0Y2NkOGI2ZSIsIm5iZiI6MTc2MzA0NTE5OS4wOCwic3ViIjoiNjkxNWVmNGYwMDQxOTU0NjA4YTBkZjA0Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.9D_r4JCstflEuuhrR9YqUi3077_v6E703Td7cliNKwU',
    LANG: 'ko-KR',
    REGION: 'KR',
};

<<<<<<< HEAD
=======
// 탭 input 모두 가져오기
const categoryInputs = document.querySelectorAll('input[name="categoryTab"]');

// 탭 변경 시 render 함수 호출
categoryInputs.forEach(input => {
    input.addEventListener('change', () => {
        const category = input.value;   // movie | book | music

        if (category === '영화') {
            loadMovies();
        } else if (category === '도서') {
            loadBooks();  // 행님이 알라딘 API 호출하는 함수
        } else if (category === '음악') {
            loadTracks(); // 음악 API 호출 함수
        }
    });
});

>>>>>>> origin/sh

// 화면에 영화 불러오기
function loadMovies() {
    const xhr = new XMLHttpRequest();
    const url = `https://api.themoviedb.org/3/discover/movie?language=${TMDB.LANG}&region=${TMDB.REGION}&sort_by=popularity.desc`;

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Authorization", "Bearer " + TMDB.BEARER);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return
        }
        if (xhr.status < 200 || xhr.status >= 400) {           // 정상 응답
            console.error("TMDB 오류:", xhr.responseText);
            return;
        }
        const data = JSON.parse(xhr.responseText);

        // 화면에 출력
        renderMovies(data.results);
    };
    xhr.send();
}

// 영화
function renderMovies(results) {
    const list = document.querySelector('#poster-container .list');
    list.innerHTML = '';
    // frag라는 변수에 모든 dom 요소들을 추가 가능
    const frag = document.createDocumentFragment();

<<<<<<< HEAD
    console.log(results);

    results.forEach(m => {
        const cardData = {
            description: m.overview
                ? m.overview.substring(0,70) + '...'
                : '영화 설명이 없습니다',
=======
    results.forEach(m => {
        const cardData = {
            description: m.overview
                        ? m.overview.substring(0,70) + '...'
                        : '영화 설명이 없습니다',
>>>>>>> origin/sh
            image: m.poster_path
                ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                : 'assets/images/no-poster.png',
            title: m.title || m.name,
            subtitle: m.release_date || '',
            score: Math.round(m.vote_average * 10),
            scoreUnit: '%',
        };
        // createCard로 만든 dom 요소들을 frag에 추가
        frag.appendChild(createCardElement(cardData, 'movie'));
    });
    // 그 frag를 list (HTML ul태그)에 추가
    list.appendChild(frag);
}

// 도서 (알라딘 결과 예시)
function renderBooks(items) {
    const list = document.querySelector('#poster-container .list');
    list.innerHTML = '';
    const frag = document.createDocumentFragment();

    items.forEach(b => {
        const cardData = {
            image: b.cover || 'assets/images/no-poster.png',
            title: b.title,
            subtitle: `${b.author || ''} · ${b.pubDate || ''}`,
            score: b.userRating ?? '★',  // 평점 없으면 다른 표시로
            scoreUnit: '',
        };
        frag.appendChild(createCardElement(cardData, 'book'));
    });
    list.appendChild(frag);
}

// 음악 (iTunes 예시)
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

// 영화, 도서, 음악 카드 li 태그로 생성하기
// type: 'movie' | 'book' | 'music'
function createCardElement(data, type) {

    // 아이템 하나
    const li = document.createElement('li');
    li.classList.add('item');

    // 아이템 안에 박스
    const card = document.createElement('article');
    card.classList.add('card', `card--${type}`);

    // 박스 안에 포스터
    const posterWrap = document.createElement('div');
    posterWrap.classList.add('card_poster');

    // 포스터 안에 이미지(포스터랑 크기 같음)
    const img = document.createElement('img');
    img.src = data.image;
    img.alt = data.title || '';

    // 포스터 안에 즐겨찾기 ★ 라벨
    const likeLabel = document.createElement('label');
    likeLabel.classList.add('card_like-label');

    // 포스터 안에 즐겨찾기 ★
    const like = document.createElement('input');
    like.type = 'checkbox';
<<<<<<< HEAD
    like.classList.add('card_like');

    // 포스터 안에 즐겨찾기 ★2
    const likeIcon = document.createElement('span');
    likeIcon.classList.add('card_like-icon');
=======
    like.classList.add('like-checkbox');

    // 포스터 안에 즐겨찾기 ★2
    const likeIcon = document.createElement('span');
    likeIcon.classList.add('like-icon');
    likeIcon.innerText = '★';
>>>>>>> origin/sh

    likeLabel.appendChild(like);
    likeLabel.appendChild(likeIcon);

    posterWrap.appendChild(img);
    posterWrap.appendChild(likeLabel);

    // 하단 흰색 부분
    const bottom = document.createElement('div');
    bottom.classList.add('card_bottom');

    // 점수부분
    const score = document.createElement('div');
    score.classList.add('card_score');

    // 점수 숫자
    const scoreNum = document.createElement('span');
    scoreNum.classList.add('card_score-num');
    scoreNum.textContent = data.score ?? '–';
    // % 표시
    const scoreUnit = document.createElement('span');
    scoreUnit.classList.add('card_score-unit');
    scoreUnit.textContent = data.scoreUnit ?? '%';

    score.appendChild(scoreNum);
    score.appendChild(scoreUnit);

    // 글자 박스
    const meta = document.createElement('div');
    meta.classList.add('card_meta');

    // 제목
    const title = document.createElement('p');
    title.classList.add('card_title');
    title.textContent = data.title;

    // 개봉일자
    const subtitle = document.createElement('p');
    subtitle.classList.add('card_subtitle');
    subtitle.textContent = data.subtitle ?? '';

    // HOVER시 간략한 설명 글
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
<<<<<<< HEAD
}

loadMovies();
=======
}
>>>>>>> origin/sh
