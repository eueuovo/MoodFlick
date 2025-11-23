import { createCardElement } from '../index.js';

/* ===========================================================
   1. 전시 / 공연 API 요청(fetchCultural)
   -----------------------------------------------------------
   - page 값을 정상적으로 반영하도록 pageNo = page 로 수정
   - 서비스 키, 기간 설정 OK
   =========================================================== */
export const fetchCultural = (page = 1) => {
    const url = new URL('https://apis.data.go.kr/B553457/cultureinfo/period2');

    url.searchParams.set('serviceKey',
        '89YiOxOkyK6UlZ801yXmfUJP0oT9U6f6YMbAycEXoblUG1jvQbXfWFNgXwMGNWjHkGXhIA/JjY/M2cCOURanpQ=='
    );

    url.searchParams.set('numOfrows', '10');   // 한 페이지 10개
    url.searchParams.set('PageNo', page);      // ⬅ 페이지 넘버 반영됨
/*  url.searchParams.set('from', '20000101');
    url.searchParams.set('to', '20301231');*/

    console.log("요청 페이지:", page);
    console.log("요청 URL:", url.toString());

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
        thumbnail: item.querySelector("thumbnail")?.textContent ?? "",
        startDate: item.querySelector("startDate")?.textContent ?? "",
        endDate: item.querySelector("endDate")?.textContent ?? "",
        realName: item.querySelector("realName")?.textContent ?? ""
    }));

    const totalCount = Number(xml.querySelector("totalCount")?.textContent ?? 0);
    const numOfrows = Number(xml.querySelector("numOfrows")?.textContent ?? 10);
    const totalPages = Math.ceil(totalCount / numOfrows);


    console.log("XML totalCount:", xml.querySelector("totalCount")?.textContent);
    console.log("XML numOfRows:", xml.querySelector("numOfrows")?.textContent);
    console.log("결과 totalPages:", totalPages);
    console.log("받은 item 개수:", items.length);

    return { items, totalPages };

}


/* ===========================================================
   3. 카드 UI에 넣을 데이터 변환 (mapExpoToCardData)
   -----------------------------------------------------------
   - 원본 썸네일이 절대경로가 아니라 `/upload/...` 로 오기 때문에
     앞에 culture.go.kr 도메인을 붙여서 정상 출력되게 함.
   - 이미지가 없으면 기본 이미지 사용
   =========================================================== */
export function mapExpoToCardData(expo) {
    const base = "https://www.culture.go.kr";   // 실제 이미지 도메인

    return {
        image:expo.thumbnail,                   // 기본 이미지
        title: expo.title,
        subtitle: `${expo.place} · ${expo.startDate} ~ ${expo.endDate}`,
        description: expo.realName,
        score: null,
        scoreUnit: ""
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
