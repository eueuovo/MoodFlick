import { createCardElement } from '../index.js';

/* ===========================================================
   1. 전시 / 공연 API 요청(fetchCultural)
   =========================================================== */
export const fetchCultural = (page = 1, options = {}) => {
    const url = new URL('https://apis.data.go.kr/B553457/cultureinfo/period2');

    url.searchParams.set('serviceKey',
        '89YiOxOkyK6UlZ801yXmfUJP0oT9U6f6YMbAycEXoblUG1jvQbXfWFNgXwMGNWjHkGXhIA/JjY/M2cCOURanpQ=='
    );

    url.searchParams.set('numOfrows', '10');   // 한 페이지 10개
    url.searchParams.set('PageNo', page);// ⬅ 페이지 넘버 반영됨

    // 🔥 keyword 필터 적용
    if (options.keyword) {
        url.searchParams.set("keyword", options.keyword);
    }

    // 🔥 serviceTp 필터 적용
    if (options.serviceTp) {
        url.searchParams.set("serviceTp", options.serviceTp);
    }

    return fetch(url)
        .then(res => res.text())
        .then(xmlString => {
            const parser = new DOMParser();
            return parser.parseFromString(xmlString, "application/xml");


        });

};

/* ===========================================================
   2. XML → JS 데이터 변환 (parseExpo)
   ---------------------------------------------------------- */
export function parseExpo(xml) {
    const items = [...xml.querySelectorAll("item")].map(item => ({
        title: item.querySelector("title")?.textContent ?? "",
        place: item.querySelector("place")?.textContent ?? "",
        area: item.querySelector("area")?.textContent ?? "",
        serviceName : item.querySelector("serviceName")?.textContent ?? "",
        thumbnail: item.querySelector("thumbnail")?.textContent ?? "",
        startDate: item.querySelector("startDate")?.textContent ?? "",
        endDate: item.querySelector("endDate")?.textContent ?? "",
        realName: item.querySelector("realName")?.textContent ?? ""
    }));

    const totalCount = Number(xml.querySelector("totalCount")?.textContent ?? 0);
    const numOfrows = Number(xml.querySelector("numOfrows")?.textContent ?? 10);
    const totalPages = Math.ceil(totalCount / numOfrows);

    return { items, totalPages };

}


/* ===========================================================
   3. 카드 UI에 넣을 데이터 변환 (mapExpoToCardData)
   =========================================================== */
export function mapExpoToCardData(expo) {
    const base = "https://www.culture.go.kr";   // 실제 이미지 도메인

    return {
        image:expo.thumbnail,                   // 기본 이미지
        title: expo.title,
        area:expo.area,
        serviceName:expo.serviceName,
        subtitle: `${expo.place} · ${expo.startDate} ~ ${expo.endDate}`,
        description: expo.realName,
        realName:expo.realName
    };
}


/* ===========================================================
   4. 전체 데이터 불러오기 (필터용)
   -----------------------------------------------------------
   - 초기 필터/검색 기능에서 전체 목록이 필요할 때 사용
   =========================================================== */
let expoAllItems = [];

export async function fetchAllCultural() {
    const firstXml = await fetchCultural(1);
    const { items: firstItems, totalPages } = parseExpo(firstXml);

    let allItems = [...firstItems];

    for (let page = 2; page <= totalPages; page++) {
        const xml = await fetchCultural(page);
        const { items } = parseExpo(xml);
        allItems.push(...items);
    }

    return allItems;
}


/* ===========================================================
   5. 페이지네이션 변수
   =========================================================== */
let expoCurrentPage = 1;
const expoItemsPerPage = 10;
let expoTotalPages = 1;

const expoNumbersBox = document.querySelector('#expo-page-container .page-numbers');
const expoFirstBtn = document.querySelector('#expo-page-container .first');
const expoPrevBtn = document.querySelector('#expo-page-container .prev');
const expoNextBtn = document.querySelector('#expo-page-container .next');
const expoLastBtn = document.querySelector('#expo-page-container .last');


/* ===========================================================
   6. 페이지 데이터 로딩(loadExpo)
   -----------------------------------------------------------
   - 페이지 변화 있을 때 호출됨
   =========================================================== */
export function loadExpo(page = 1) {
    expoCurrentPage = page;

    const ul = document.querySelector("#expo-list");
    ul.innerHTML = "";

    fetchCultural(page).then(xml => {
        const { items, totalPages } = parseExpo(xml);
        expoTotalPages = totalPages;

        items.forEach(expo => {
            const cardData = mapExpoToCardData(expo);
            const card = createCardElement(cardData, "expo");
            ul.appendChild(card);
        });

        renderExpoPage();
    });
}
/*---------------------------------------------------------------------------------*/
//필터 함수//

function loadExpoWithApiFilter(options = {}) {
    const ul = document.querySelector("#expo-list");
    ul.innerHTML = "";

    fetchCultural(1, options).then(xml => {
        const { items } = parseExpo(xml);

        items.forEach(expo => {
            const cardData = mapExpoToCardData(expo);
            const card = createCardElement(cardData, "expo");
            ul.appendChild(card);
        });
    });
}
const searchBtn = document.querySelector(".filter-search-btn");
const keywordInput = document.getElementById("filter-place");
const typeItems = document.querySelectorAll(".event-type li");

let selectedType = ""; // serviceTp 저장

// 유형 클릭 이벤트
typeItems.forEach(li => {
    li.addEventListener("click", () => {
        typeItems.forEach(x => x.classList.remove("active"));
        li.classList.add("active");
        selectedType = li.dataset.value; // 🔥 serviceTp 코드
    });
});

// 검색 버튼
searchBtn.addEventListener("click", () => {
    const keyword = keywordInput.value;

    loadExpoWithApiFilter({
        keyword,
        serviceTp: selectedType
    });
});
/*--------------------------------------------------------------------------*/
/* ===========================================================
   7. 페이지 번호 UI 생성(renderExpoPage)
   =========================================================== */
function renderExpoPage() {
    expoNumbersBox.innerHTML = "";

    const maxVisible = 5;
    let start = expoCurrentPage - Math.floor(maxVisible / 2);
    let end = expoCurrentPage + Math.floor(maxVisible / 2);

    if (start < 1) {
        end += (1 - start);
        start = 1;
    }
    if (end > expoTotalPages) {
        start -= (end - expoTotalPages);
        end = expoTotalPages;
    }
    if (start < 1) start = 1;

    for (let i = start; i <= end; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("page-number");

        if (i === expoCurrentPage) btn.classList.add("active");

        btn.addEventListener("click", () => loadExpo(i));

        expoNumbersBox.appendChild(btn);
    }

    expoFirstBtn.disabled = expoCurrentPage === 1;
    expoPrevBtn.disabled = expoCurrentPage === 1;
    expoNextBtn.disabled = expoCurrentPage === expoTotalPages;
    expoLastBtn.disabled = expoCurrentPage === expoTotalPages;
}


/* ===========================================================
   8. 페이지네이션 버튼 이벤트
   =========================================================== */
expoFirstBtn.addEventListener("click", () => {
    if (expoCurrentPage > 1) loadExpo(1);
});

expoPrevBtn.addEventListener("click", () => {
    if (expoCurrentPage > 1) loadExpo(expoCurrentPage - 1);
});

expoNextBtn.addEventListener("click", () => {
    if (expoCurrentPage < expoTotalPages) loadExpo(expoCurrentPage + 1);
});

expoLastBtn.addEventListener("click", () => {
    if (expoCurrentPage < expoTotalPages) loadExpo(expoTotalPages);
});


/* ===========================================================
   9. 필요할 경우 페이지네이션 정보 업데이트
   =========================================================== */
function updateExpoPagination(totalPages) {
    expoTotalPages = totalPages;
    renderExpoPage();
}

