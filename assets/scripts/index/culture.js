let allExpoData = [];
let currentPage =1;
const perPage = 10;



// 관람 전시 api api 가져오기
 export  const fetchCultural = (pageNo = 1) => {
    const url = new URL('https://apis.data.go.kr/B553457/cultureinfo/period2');
    url.searchParams.set('serviceKey', '89YiOxOkyK6UlZ801yXmfUJP0oT9U6f6YMbAycEXoblUG1jvQbXfWFNgXwMGNWjHkGXhIA/JjY/M2cCOURanpQ==');
    url.searchParams.set('numOfRows', '10');
    url.searchParams.set('pageNo', pageNo);
    /*url.searchParams.set('resultType', 'xml');*/

    return fetch(url)               // ★ return 추가
        .then(response => response.text())
        .then(xmlString => {
            console.log(xmlString)
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlString, "application/xml");
            return xml;             // 다음 .then으로 xml 넘김
        });

};


export const getAllCultural = async () => {
    const totalPages = 286;
    let allItems = [];

    for (let page = 1; page <= totalPages; page++) {
        const xml = await fetchCultural(page);
        console.log(page + "페이지 가져옴");

        const items = xml.getElementsByTagName("item");
        for (let i = 0; i < items.length; i++) {
            allItems.push(items[i]);
        }
    }
    return allItems

}

export function renderExpo(data) {
    let items = [];

    // 1) XML 문서인 경우 (querySelectorAll 있음)
    if (data.querySelectorAll) {
        items = data.querySelectorAll("item");
    }
    // 2) 이미 item 배열인 경우
    else if (Array.isArray(data)) {
        items = data;
    }
    else {
        console.error("renderExpoUniversal: 지원하지 않는 데이터 형식");
        return [];
    }

    // 3) item들을 JS 객체로 변환
    return [...items].map(item => ({
        title: item.querySelector("title")?.textContent ?? "",
        place: item.querySelector("place")?.textContent ?? "",
        area: item.querySelector("area")?.textContent ?? "",
        thumbnail: item.querySelector("thumbnail")?.textContent ?? "",
        startDate: item.querySelector("startDate")?.textContent ?? "",
        endDate: item.querySelector("endDate")?.textContent ?? "",
        realName: item.querySelector("realName")?.textContent ?? "",
    }));
}




export function loadExpo(list) {
    const ul = document.querySelector("#expo-list");
    ul.innerHTML = '';

    if (!Array.isArray(list)) return;

    list.forEach(data => {
        const card = createExpoCard(data);
        ul.appendChild(card);
    });
}

export function createExpoCard(data) {
    const li = document.createElement("li");
    li.classList.add("item","expo-item");
    li.innerHTML = `
        <div class="card card--expo">
            <div class="card_poster">
                <img src="${data.thumbnail}" alt="${data.title}">
                 <label class="card_like-label">
                  <input type="checkbox" class="like-checkbox">
                  <span class="like-icon">★</span>
                </label>
            </div>
            <div class="card_bottom">
                <p class="card_title">${data.title}</p>
                <p class="card_subtitle">${data.place}</p>
                <p class="card_subtitle">${data.startDate} ~ ${data.endDate}</p>
            </div>
        </div>
    `;

    return li;
}

async function startExpo() {
    const xmlItems = await getAllCultural(); // 전체 페이지 로드
    allExpoData = renderExpo(xmlItems);      // JS 객체 변환
    loadExpo(allExpoData);                   // 전부 한 번에 화면 출력
}




startExpo();
