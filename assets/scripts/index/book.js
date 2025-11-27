import { createCardElement, dialogHandler } from '../index.js';

let currentPage = 1;
const itemsPerPage = 12;
let totalItems = 0;
let totalPages = 1;

// 특정 페이지 로드 (페이지 이동 시마다 API를 호출)
export async function loadGoogleBooksPage(page = 1, keyword = currentKeyword) {
    currentPage = page;
    const pageContainer = document.querySelector('#page-container');

    // 현재 페이지 로딩 표시
    const list = document.querySelector('#poster-container .list');
    if (list) {
        list.innerHTML = `<p class="loading">도서 불러오는 중...</p>`;
    }

    if (pageContainer) {
        pageContainer.style.display = 'none';
    }

    // keyword가 있으면 제목 필드로 제한, 없으면 기본 subject:fiction
    const query = encodeURIComponent(
        keyword ? `intitle:"${keyword}"` : 'subject:fiction');

    currentKeyword = keyword;

    // 요청 시작 지점 계산 (페이지 번호 기반)
    const startIndex = (page - 1) * itemsPerPage;

    const url =
        `https://www.googleapis.com/books/v1/volumes?q=${query}` +
        `&key=AIzaSyCNbz5sSjh_AJ9buWD0QDSV_3m9nY1jyP4` +
        `&maxResults=${itemsPerPage}` +
        `&startIndex=${startIndex}` +
        `&orderBy=newest`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.items || data.items.length === 0) {
            console.log("데이터 없음");
            if (list) list.innerHTML =  list.innerHTML = `
          <div class="no-results" style= "display:flex; flex-direction: column; align-items:center; justify-content:center; padding-bottom: 3rem;">
            <img src="assets/images/index/main/search.png" alt="검색 결과 없음 아이콘" style="width: 2rem; height: 2rem;">
            <p>"${keyword}" 로 된 도서를 찾을 수 없습니다.\n
               다른 키워드로 다시 검색해 보세요.</p>
          </div>
        `;
            totalItems = 0;
            totalPages = 1;



            const pageContainer = document.querySelector('#page-container');
            if (pageContainer) {
                pageContainer.style.paddingLeft = '4rem'; // 왼쪽으로 4rem 이동
            }

            renderPagination();
            return;
        }

        const filteredItems = data.items;

        if (pageContainer) {
            pageContainer.style.display = 'flex';
        }

        // 전체 도서 수 (totalItems)와 총 페이지 수 업데이트
        totalItems = data.totalItems;
        totalPages = Math.ceil(totalItems / itemsPerPage);

        // 렌더링
        renderGoogleBooks(filteredItems);
        renderPagination();

    } catch (err) {
        console.error("구글 북스 api 오류", err);
        if (list) list.innerHTML = `<p style="color:red;">데이터 로딩 오류가 발생했습니다.</p>`;
        totalItems = 0;
        totalPages = 1;
        renderPagination();
    }
}

// 도서 렌더링
function renderGoogleBooks(items) {
    const list = document.querySelector('#poster-container .list');
    list.innerHTML = '';
    const frag = document.createDocumentFragment();

    items.forEach(b => {
        const volumeInfo = b.volumeInfo;
        const fullDesc = volumeInfo.description || '도서 설명이 없습니다.';
        // 랜덤 점수 생성 (3.0 ~ 5.0)
        const randomScore = (Math.random() * 2 + 3).toFixed(1);
        const cardData = {
            id: b.id,
            image: volumeInfo.imageLinks?.thumbnail || 'assets/images/index/main/no-poster.png',
            title: volumeInfo.title,
            subtitle: `${volumeInfo.authors?.join(", ") || ""} · ${volumeInfo.publishedDate || ""}`,
            score: randomScore,
            scoreUnit: '%',
            description: '클릭하여 도서 상세 보기',
            fullDescription: fullDesc
        };
        frag.appendChild(createCardElement(cardData, 'book'));
    });
    list.appendChild(frag);
}

// top5 도서 로드
export async function loadTop5Books() {
    const query = encodeURIComponent('bestseller');

    const url =
        `https://www.googleapis.com/books/v1/volumes?q=${query}` +
        `&key=AIzaSyCNbz5sSjh_AJ9buWD0QDSV_3m9nY1jyP4` +
        `&maxResults=20` + // 20개 가져와서 랜덤 점수 기준으로 정렬
        `&orderBy=relevance`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.items || data.items.length === 0) {
            console.log("Top5 도서 데이터 없음");
            return;
        }

        // 각 도서에 랜덤 점수를 부여하고 점수 기준으로 정렬
        const booksWithScore = data.items.map(book => ({
            ...book,
            randomScore: parseFloat((Math.random() * 2 + 3).toFixed(1)) // 3.0 ~ 5.0
        }));

        // 점수 높은 순으로 정렬하여 상위 5개 선택
        const top5 = booksWithScore
            .sort((a, b) => b.randomScore - a.randomScore)
            .slice(0, 5);

        renderTop5Books(top5);

    } catch (err) {
        console.error("구글 북스 Top5 오류:", err);
    }
}

// top5 도서 렌더링
function renderTop5Books(books) {
    if (!books || books.length === 0) return;

    // 도서 탭의 top5만 선택
    const topElements = document.querySelectorAll('.--splash[data-tab="도서"] .top-five .top');

    books.forEach((book, index) => {
        if (index < topElements.length) {
            const topEl = topElements[index];
            const img = topEl.querySelector('.img');
            const title = topEl.querySelector('.title');
            const score = topEl.querySelector('.score');

            const volumeInfo = book.volumeInfo;

            if (img) {
                img.src = volumeInfo.imageLinks?.thumbnail ||
                    'assets/images/index/main/no-poster.png';
            }

            if (title) {
                const bookTitle = volumeInfo.title;
                title.textContent = bookTitle.length > 15
                    ? bookTitle.slice(0, 15) + '...'
                    : bookTitle;
            }

            if (score) {
                // 랜덤 점수 사용
                score.textContent = `★ ${book.randomScore}`;
            }
        }
    });
}

// ===== 페이지네이션 관련 =====

let currentKeyword;
// 페이지네이션 렌더링
function renderPagination() {
    const container = document.querySelector('#page-container');
    if (!container) return;

    container.innerHTML = `
        <button class="page-btn first">«</button>
        <button class="page-btn prev"><</button>
        <div class="page-numbers"></div>
        <button class="page-btn next">></button>
        <button class="page-btn last">»</button>
    `;

    const numbersBox = container.querySelector('.page-numbers');
    const firstBtn = container.querySelector('.first');
    const prevBtn = container.querySelector('.prev');
    const nextBtn = container.querySelector('.next');
    const lastBtn = container.querySelector('.last');

    // 숫자 페이지 버튼
    const maxVisible = 5;
    let start = currentPage - Math.floor(maxVisible / 2);
    let end = currentPage + Math.floor(maxVisible / 2);
    if (start < 1) { end += 1 - start; start = 1; }
    if (end > totalPages) { start -= (end - totalPages); end = totalPages; }
    if (start < 1) start = 1;

    for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.add('page-number');
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => loadGoogleBooksPage(i, currentKeyword));
        numbersBox.appendChild(btn);
    }

    // <<, <, >, >> 버튼 이벤트
    firstBtn.addEventListener('click', () => { if (currentPage > 1) loadGoogleBooksPage(1, currentKeyword); });
    prevBtn.addEventListener('click', () => { if (currentPage > 1) loadGoogleBooksPage(currentPage - 1, currentKeyword); });
    nextBtn.addEventListener('click', () => { if (currentPage < totalPages) loadGoogleBooksPage(currentPage + 1, currentKeyword); });
    lastBtn.addEventListener('click', () => { if (currentPage < totalPages) loadGoogleBooksPage(totalPages, currentKeyword); });

    // 버튼 활성/비활성
    firstBtn.disabled = prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = lastBtn.disabled = currentPage === totalPages;
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
                loadGoogleBooksPage(1,currentKeyword);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                loadGoogleBooksPage(currentPage - 1,currentKeyword);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                loadGoogleBooksPage(currentPage + 1,currentKeyword);
            }
        });
    }

    if (lastBtn) {
        lastBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                loadGoogleBooksPage(totalPages,currentKeyword);
            }
        });
    }
});