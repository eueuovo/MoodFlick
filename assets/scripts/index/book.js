import { createCardElement, dialogHandler } from '../index.js';

let currentPage = 1;
const itemsPerPage = 12;
let totalItems = 0;
let totalPages = 1;

// 특정 페이지 로드 (페이지 이동 시마다 API를 호출)
export async function loadGoogleBooksPage(page = 1) {
    currentPage = page;

    const list = document.querySelector('#poster-container .list');
    if (list) {
        list.innerHTML = `<p>데이터를 불러오는 중...</p>`;
    }

    const query = encodeURIComponent('subject:fiction');
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
            if (list) list.innerHTML = `<p>도서 데이터가 없습니다. 검색 조건을 확인하세요.</p>`;
            totalItems = 0;
            totalPages = 1;
            renderPagination();
            return;
        }

        const filteredItems = data.items;
        totalItems = data.totalItems;
        totalPages = Math.ceil(totalItems / itemsPerPage);

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