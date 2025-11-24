import { createCardElement, dialogHandler } from '../index.js';

// 영화 API 연결
const TMDB = {
    BEARER: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOGMxNjlkZjU3MDExMjliYTlmY2UyZGI0Y2NkOGI2ZSIsIm5iZiI6MTc2MzA0NTE5OS4wOCwic3ViIjoiNjkxNWVmNGYwMDQxOTU0NjA4YTBkZjA0Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.9D_r4JCstflEuuhrR9YqUi3077_v6E703Td7cliNKwU',
    LANG: 'ko-KR',
    REGION: 'KR',
    PAGE: 1
};

// 화면에 영화 불러오기
export function loadMovies() {
    const xhr = new XMLHttpRequest();
    const url = `https://api.themoviedb.org/3/discover/movie?language=${TMDB.LANG} +
                &region=${TMDB.REGION}
                &sort_by=popularity.desc
                &page=${TMDB.PAGE}`;

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

    results.slice(0,10).forEach(m => {
        const cardData = {
            description: '클릭하여 영화 상세 보기',
            fullDescription: m.overview || '영화 설명이 없습니다.',
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
// 버튼 동작
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