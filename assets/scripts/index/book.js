import { createCardElement, dialogHandler } from '../index.js';

let currentPage = 1;
const itemsPerPage = 10;
let totalItems = 0;
let totalPages = 1;
let allBooks = []; // 전체 도서 데이터를 저장

// 전체 도서 데이터를 한 번에 가져오기
export function loadAllBooks() {
    const fetchAmount = 40; // 최대 40
    const url = `https://www.googleapis.com/books/v1/volumes?q=a&key=AIzaSyCNbz5sSjh_AJ9buWD0QDSV_3m9nY1jyP4&maxResults=${fetchAmount}&langRestrict=ko&orderBy=newest`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.items || data.items.length === 0){
                console.log("데이터 없음");
                return;
            }

            // 출시일 기준으로 정렬 (최신순)
            allBooks = data.items
                .filter(item => item.volumeInfo.publishedDate) // 날짜 있는 것만
                .sort((a, b) => {
                    const dateA = new Date(a.volumeInfo.publishedDate);
                    const dateB = new Date(b.volumeInfo.publishedDate);
                    return dateB - dateA; // 최신순 (내림차순)
                });

            totalItems = allBooks.length;
            totalPages = Math.ceil(totalItems / itemsPerPage);

            // 첫 페이지 렌더링
            loadGoogleBooksPage(1);
        })
        .catch(err => console.error("구글 북스 api 오류", err));
}

// 특정 페이지 로드
export function loadGoogleBooksPage(page = 1){
    currentPage = page;

    // 전체 데이터가 없으면 먼저 로드
    if (allBooks.length === 0) {
        loadAllBooks();
        return;
    }

    // 현재 페이지에 해당하는 10개만 추출
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageBooks = allBooks.slice(startIndex, endIndex);

    renderGoogleBooks(pageBooks);
    renderPagination();
}

//도서 랜더링
function renderGoogleBooks(items) {
    const list = document.querySelector('#poster-container .list');
    list.innerHTML = '';
    const frag = document.createDocumentFragment();

    items.forEach(b => {
        const volumeInfo = b.volumeInfo;
        const fullDesc = volumeInfo.description || '도서 설명이 없습니다.';
        const cardData = {
            image: volumeInfo.imageLinks?.thumbnail || 'assets/images/index/main/no-poster.png',
            title: volumeInfo.title,
            subtitle: `${volumeInfo.authors?.join(", ") || ""} · ${volumeInfo.publishedDate || ""}`,
            score: volumeInfo.averageRating ?? '★',
            scoreUnit: '',
            description: '클릭하여 도서 상세 보기',
            fullDescription: fullDesc
        };
        frag.appendChild(createCardElement(cardData, 'book'));
    });
    list.appendChild(frag);
}

// 페이지네이션 렌더링
function renderPagination() {
    const numbersBox = document.querySelector('#page-container > .page-numbers');
    const firstBtn = document.querySelector('#page-container > .first');
    const prevBtn = document.querySelector('#page-container > .prev');
    const nextBtn = document.querySelector('#page-container > .next');
    const lastBtn = document.querySelector('#page-container > .last');

    if (!numbersBox) {
        console.error('페이지네이션 컨테이너를 찾을 수 없습니다.');
        return;
    }

    numbersBox.innerHTML = '';

    const maxVisible = 5;
    let start = currentPage - Math.floor(maxVisible / 2);
    let end = currentPage + Math.floor(maxVisible / 2);

    if (start < 1) {
        end += (1 - start);
        start = 1;
    }
    if (end > totalPages) {
        start -= (end - totalPages);
        end = totalPages;
    }
    if (start < 1) start = 1;

    for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.add('page-number');
        if (i === currentPage) {
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => {
            loadGoogleBooksPage(i);
        });
        numbersBox.appendChild(btn);
    }

    // 버튼 활성화/비활성화
    if (firstBtn) firstBtn.disabled = currentPage === 1;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    if (lastBtn) lastBtn.disabled = currentPage === totalPages;
}

// 버튼 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    const firstBtn = document.querySelector('#page-container > .first');
    const prevBtn = document.querySelector('#page-container > .prev');
    const nextBtn = document.querySelector('#page-container > .next');
    const lastBtn = document.querySelector('#page-container > .last');

    if (firstBtn) {
        firstBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                loadGoogleBooksPage(1);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                loadGoogleBooksPage(currentPage - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                loadGoogleBooksPage(currentPage + 1);
            }
        });
    }

    if (lastBtn) {
        lastBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                loadGoogleBooksPage(totalPages);
            }
        });
    }
});