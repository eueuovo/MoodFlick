import { createCardElement, dialogHandler } from '../index.js';

let currentPage = 1;
const itemsPerPage = 12;
let totalItems = 0; // API에서 받은 전체 결과 수
let totalPages = 1;

// ⭐ 전체 도서 데이터를 한 번에 가져오는 loadAllBooks 함수는 제거됩니다.
// ⭐ loadGoogleBooksPage 함수가 API를 직접 호출하도록 수정됩니다.
// export function loadAllBooks() { ... } // 이 함수는 이제 필요 없습니다.

// 특정 페이지 로드 (페이지 이동 시마다 API를 호출)
//검색할때 키워드로 로드할 수 있게 매개변수 키워드 추가)

export async function loadGoogleBooksPage(page = 1,keyword =currentKeyword) {
    currentPage = page;

    // 현재 페이지 로딩 표시
    const list = document.querySelector('#poster-container .list');
    if (list) {
        list.innerHTML = `<p>데이터를 불러오는 중...</p>`;
    }



    // keyword가 있으면 제목 필드로 제한, 없으면 기본 subject:fiction
    const query = encodeURIComponent(
        keyword ? `intitle:"${keyword}"` : 'subject:fiction');

    currentKeyword = keyword;

    // 요청 시작 지점 계산 (페이지 번호 기반)
    const startIndex = (page - 1) * itemsPerPage;

    // URL 구성: 10개씩 요청하고 시작 인덱스를 지정합니다.
    const url =
        `https://www.googleapis.com/books/v1/volumes?q=${query}` +
        `&key=AIzaSyCNbz5sSjh_AJ9buWD0QDSV_3m9nY1jyP4` +
        `&maxResults=${itemsPerPage}` +      // 12개만 요청
        `&startIndex=${startIndex}` +        // 시작 위치 지정
        `&orderBy=newest`;                   // 최신순 정렬

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

//도서 랜더링 (변경 없음)
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
let currentKeyword;
// 페이지네이션 렌더링 (변경 없음)
function renderPagination() {
    const numbersBox = document.querySelector('#page-container > .page-numbers');
    const firstBtn = document.querySelector('#page-container > .first');
    const prevBtn = document.querySelector('#page-container > .prev');
    const nextBtn = document.querySelector('#page-container > .next');
    const lastBtn = document.querySelector('#page-container > .last');


    const pageContainer = document.querySelector('#page-container');



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
            loadGoogleBooksPage(i,currentKeyword);
        });
        numbersBox.appendChild(btn);
    }

    // 버튼 활성화/비활성화
    if (firstBtn) firstBtn.disabled = currentPage === 1;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    if (lastBtn) lastBtn.disabled = currentPage === totalPages;
}

// 버튼 이벤트 리스너 (DOMContentLoaded 시 loadGoogleBooksPage(1) 호출로 수정)
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