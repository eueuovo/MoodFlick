// 알라딘 API 연결
const fetchBook = () => {
    const proxy = "https://cors-anywhere.herokuapp.com/";
    const url = "https://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=ttbehgml10730857001&QueryType=Bestseller&MaxResults=3&start=1&SearchTarget=Book&output=js&Version=20131101";

    fetch(proxy + url)
        .then(res => res.text()) // JSON 대신 텍스트로 받기
        .then(txt => console.log("응답", txt))
        .catch(err => console.error("오류", err));
}

/*const fetchMusic = (query) => {
    const apiKey = "4f438fd7a7cfa2dfae9f08f0b51095bb";
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${apiKey}&format=json`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log("검색 결과:", data.results.artistmatches.artist);
        })
        .catch(err => console.error(err));
};*/

// 영화 API 연결
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

const fetchCultural = () => {
    const xhr = new XMLHttpRequest();
    const url = new URL('https://apis.data.go.kr/B553457/cultureinfo/period2');
    url.searchParams.set('serviceKey', '89YiOxOkyK6UlZ801yXmfUJP0oT9U6f6YMbAycEXoblUG1jvQbXfWFNgXwMGNWjHkGXhIA/JjY/M2cCOURanpQ==');
    url.searchParams.set(numOfRows, '50');
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('resultType', 'json');
    xhr.onreadystatechange = () => {
        if(xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }
        if(xhr.status < 200 || xhr.status >= 400){
            console.log('공연정보 불러오기 실패');
            return;
        }
        console.log('성공');
    };
    xhr.open('GET', url);
    xhr.send();
}

//모달
const dialogHandler = {
    $dialog: document.getElementById('dialog'),
    $modals: [],

    //모달 숨기기
    hide: ($modal) => {
        const index = dialogHandler.$modals.indexOf($modal);
        if (index > -1) dialogHandler.$modals.splice(index, 1);
        $modal.classList.remove('visible');
        if (dialogHandler.$modals.length === 0)
            dialogHandler.$dialog.classList.remove('visible');
        else dialogHandler.$modals.at(-1).classList.remove('collapsed');

        setTimeout(() => $modal.remove(), 0);
    },

    //모달 보여주기
    show: (args) => {
        for (const $m of dialogHandler.$modals) $m.classList.add('collapsed');
        const $modal = document.createElement('div');
        $modal.classList.add('modal');

        const $title = document.createElement('div');
        $title.classList.add('title');
        $title.innerText = args.title;
        $modal.append($title);

        const $content = document.createElement('div');
        $content.classList.add('content');
        if (args.isContentHtml) $content.innerHTML = args.content;
        else $content.innerText = args.content;
        $modal.append($content);

        if (args.buttons?.length){
            const $btnContainer = document.createElement('div');
            $btnContainer.classList.add('button-container');
            args.buttons.forEach((btn) => {
                const $b = document.createElement('button');
                $b.classList.add('button');
                $b.type = 'button';
                $b.innerText = btn.caption;
                if (typeof btn.onclick === 'function')
                    $b.addEventListener('click', () => btn.onclick($modal));
                $btnContainer.append($b);
            });
            $modal.append($btnContainer);
        }

        dialogHandler.$dialog.append($modal);
        dialogHandler.$dialog.classList.add('visible');
        dialogHandler.$modals.push($modal);

        setTimeout(() => $modal.classList.add('visible'), 50);
        if (typeof args.onshow === 'function') args.onshow($modal);

        return $modal;
    },

    //간단한 확인 모달
    showSimpleOk: (title, content, args = {}) =>
        dialogHandler.show({
            title,
            content,
            isContentHtml: args.isContentHtml,
            buttons: [
                {
                    caption: args.okCaption ?? '확인',
                    onclick: ($modal) => {
                        dialogHandler.hide($modal);
                        if (typeof args.onclick === 'function')
                            args.onclick($modal);
                    },
                },
            ],
        }),
};

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
    like.classList.add('like-checkbox');

    const likeIcon = document.createElement('span');
    likeIcon.classList.add('like-icon');
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

loadMovies();

