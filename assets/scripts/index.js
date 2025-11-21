// 로그인 모달
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

// 영화 API 연결
const TMDB = {
    BEARER: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOGMxNjlkZjU3MDExMjliYTlmY2UyZGI0Y2NkOGI2ZSIsIm5iZiI6MTc2MzA0NTE5OS4wOCwic3ViIjoiNjkxNWVmNGYwMDQxOTU0NjA4YTBkZjA0Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.9D_r4JCstflEuuhrR9YqUi3077_v6E703Td7cliNKwU',
    LANG: 'ko-KR',
    REGION: 'KR',
    PAGE: 1
};


// 화면에 영화 불러오기
function loadMovies() {
    const xhr = new XMLHttpRequest();
    const url = `https://api.themoviedb.org/3/discover/movie?language=${TMDB.LANG}&region=${TMDB.REGION}&sort_by=popularity.desc&page=${TMDB.PAGE}`;

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Authorization", "Bearer " + TMDB.BEARER);

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status < 200 || xhr.status >= 400) {
            console.error("TMDB 오류:", xhr.responseText);
            return;
        }

        const data = JSON.parse(xhr.responseText);
        totalPages = data.total_pages;
        renderMovies(data.results);
        renderPage();
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

// 카드 요소 만들기
function createCardElement(data, type) {
    const li = document.createElement('li');
    li.classList.add('item');

    const card = document.createElement('article');
    card.classList.add('card', `card--${type}`);

    //포스터
    const posterWrap = document.createElement('div');
    posterWrap.classList.add('card_poster');

    const img = document.createElement('img');
    img.src = data.image;
    img.alt = data.title || '';

    //즐겨찾기
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


let currentPage = 1;
let totalPages = 1;
const numbersBox = document.querySelector(':scope #page-container > .page-numbers');
const firstBtn = document.querySelector(':scope #page-container > .first');
const prevBtn = document.querySelector(':scope #page-container > .prev');
const nextBtn = document.querySelector(':scope #page-container > .next');
const lastBtn = document.querySelector(':scope #page-container > .last');
// 번호 생성해서 화면에 보여주기
function renderPage() {
    numbersBox.innerHTML = '';

    const maxVisible = 5; // 현재 페이지 기준 5개
    let start = currentPage - Math.floor(maxVisible / 2);
    let end = currentPage + Math.floor(maxVisible / 2);

    if (start < 1) { // start 최소값 보정
        end += (1 - start);
        start = 1;
    }
    if (end > totalPages) { // end 최대값 보정
        start -= (end - totalPages);
        end = totalPages;
    }
    if (start < 1) start = 1; // 페이지가 5개 미만일 경우 대비

    for (let i = start; i <= end; i++) { // start부터 end까지 for문 돌려서 button생성
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.add('page-number');
        if(i === currentPage) { // 현재 페이지는 active 표시하기
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => {
            currentPage = i;
            loadMovies(TMDB.PAGE = currentPage);
        });
        numbersBox.appendChild(btn);
    }

    firstBtn.disabled = currentPage === 1;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    lastBtn.disabled = currentPage === totalPages;
}

firstBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage = 1;
        loadMovies(TMDB.PAGE = currentPage);
    }
});
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadMovies(TMDB.PAGE = currentPage);
    }
});
nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadMovies(TMDB.PAGE = currentPage);
    }
});
lastBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage = totalPages;
    }
    loadMovies(TMDB.PAGE = currentPage);
})
loadMovies();

