// expo.js
import { createCardElement, dialogHandler } from '../index.js';

/* ===========================================================
   1. EXPO API 요청 (XML → JSON)
=========================================================== */

const PROXIES = [
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://thingproxy.freeboard.io/fetch/${url}`
];

// XML tag 가져오기
function getTag(xml, tag) {
    const el = xml.getElementsByTagName(tag)[0];
    return el ? el.textContent : "";
}

// EXPO 데이터 불러오기
export async function fetchExpo(page = 1, rows = 10) {
    const targetUrl =
        "https://apis.data.go.kr/B553457/cultureinfo/period2" +
        `?serviceKey=89YiOxOkyK6UlZ801yXmfUJP0oT9U6f6YMbAycEXoblUG1jvQbXfWFNgXwMGNWjHkGXhIA/JjY/M2cCOURanpQ==` +
        `&PageNo=${page}&numOfrows=${rows}`;

    let lastError = null;

    // ★ 프록시 자동 재시도 로직
    for (const proxy of PROXIES) {
        const fetchUrl = proxy(targetUrl);

        try {
            const res = await fetch(fetchUrl);

            if (!res.ok) throw new Error("Proxy fetch failed");

            const xmlText = await res.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, "text/xml");

            const items = [...xml.getElementsByTagName("item")].map(item => ({
                id: getTag(item, "seq"),
                title: getTag(item, "title"),
                place: getTag(item, "place"),
                area: getTag(item, "area"),
                realmName: getTag(item, "realmName"),
                startDate: getTag(item, "startDate"),
                endDate: getTag(item, "endDate"),
                thumbnail: getTag(item, "thumbnail")
            }));

            const totalCount = Number(getTag(xml, "totalCount"));

            return { items, totalCount };
        } catch (err) {
            lastError = err;
            console.warn(`프록시 실패 → 다음 프록시로 변경:`, err);
        }
    }

    // 3개 모두 실패 시
    throw new Error("모든 프록시 요청 실패: " + lastError);
}

/* ===========================================================
   2. EXPO 렌더
=========================================================== */

export async function loadExpo(page = 1) {
    const list = document.querySelector('#poster-container .list');
    if (!list) return;

    list.innerHTML = "";

    const { items, totalCount } = await fetchExpo(page);

    if (!items.length) {
        list.innerHTML = "<p>전시/공연 데이터가 없습니다.</p>";
        return;
    }

    items.forEach(expo => {
        const cardData = {
            id: expo.id,
            image: expo.thumbnail || 'assets/images/index/main/no-poster.png',
            title: expo.title,
            subtitle: `${expo.place || ''} / ${expo.area || ''}`,
            score: expo.realm,
            description: '클릭하여 전시/공연 상세 보기',
            fullDescription: expo.title,
            type: "expo"
        };

        const cardEl = createCardElement(cardData);
        cardEl.addEventListener("click", () => dialogHandler(cardData));
        list.appendChild(cardEl);
    });

    renderExpoPagination(page, totalCount);
}

/* ===========================================================
   3. 페이지네이션
=========================================================== */

function renderExpoPagination(current, totalCount) {
    const container = document.getElementById("page-container");
    if (!container) return;

    const totalPages = Math.ceil(totalCount / 12);
    const pagesToShow = 5;

    let start = Math.max(1, current - 2);
    let end = Math.min(totalPages, start + pagesToShow - 1);

    container.innerHTML = "";

    // « 첫 페이지 버튼
    const firstBtn = document.createElement("button");
    firstBtn.className = "page-btn first";
    firstBtn.textContent = "«";
    firstBtn.disabled = current === 1;
    firstBtn.onclick = () => loadExpo(1);
    container.appendChild(firstBtn);

    // < 이전 버튼
    const prevBtn = document.createElement("button");
    prevBtn.className = "page-btn prev";
    prevBtn.textContent = "<";
    prevBtn.disabled = current === 1;
    prevBtn.onclick = () => loadExpo(current - 1);
    container.appendChild(prevBtn);

    // 페이지 번호
    const wrapper = document.createElement("div");
    wrapper.className = "page-numbers";

    for (let i = start; i <= end; i++) {
        const num = document.createElement("span");
        num.className = "page-number" + (i === current ? " active" : "");
        num.textContent = i;
        num.onclick = () => loadExpo(i);
        wrapper.appendChild(num);
    }

    container.appendChild(wrapper);

    // > 다음 버튼
    const nextBtn = document.createElement("button");
    nextBtn.className = "page-btn next";
    nextBtn.textContent = ">";
    nextBtn.disabled = current === totalPages;
    nextBtn.onclick = () => loadExpo(current + 1);
    container.appendChild(nextBtn);

    // » 마지막 페이지 버튼
    const lastBtn = document.createElement("button");
    lastBtn.className = "page-btn last";
    lastBtn.textContent = "»";
    lastBtn.disabled = current === totalPages;
    lastBtn.onclick = () => loadExpo(totalPages);
    container.appendChild(lastBtn);
}



