function loadCulture() {
// API 기본 주소 생성
    const url = new URL('https://apis.data.go.kr/B553457/cultureinfo/period2');
// API 인증키 및 필요한 옵션 추가
    url.searchParams.set('serviceKey', '89YiOxOkyK6UlZ801yXmfUJP0oT9U6f6YMbAycEXoblUG1jvQbXfWFNgXwMGNWjHkGXhIA/JjY/M2cCOURanpQ==');
    url.searchParams.set('numOfRows', '10'); // 불러올 개수
    url.searchParams.set('pageNo', '1');     // 페이지 번호 (기본 1)
    url.searchParams.set('_type', 'json');

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(err => console.error(err));
// 실제 호출
//     fetch(url)
//         .then(res => {
//             console.log(res);
//             res.text();
//         })        // 서버에서 받은 데이터는 XML 문자열 형태
//         .then(xmlString => {
//             console.log(xmlString);
//             const parser = new DOMParser();
//             // XML 문자열 → XML DOM 객체로 변환
//             return parser.parseFromString(xmlString, "application/xml");
//         });
}

function renderExpo(xml) {
    const items = xml.querySelectorAll("item");
    return [...items].map(item => ({
        title: item.querySelector("title")?.textContent,
        place: item.querySelector("place")?.textContent,
        area: item.querySelector("area")?.textContent,
        thumbnail: item.querySelector("thumbnail")?.textContent,
        startDate: item.querySelector("startDate")?.textContent,
        endDate: item.querySelector("endDate")?.textContent,
        realName: item.querySelector("realName")?.textContent,
    }));
}

// export function createExpoCard(data) {
//     const li = document.createElement("li");
//     li.classList.add("item", "expo-item");
//
//     li.innerHTML = `
//         <div class="card card--expo">
//             <div class="card_poster">
//                 <img src="${data.thumbnail}" alt="${data.title}">
//                 <label class="card_like-label">
//                     <input type="checkbox" class="like-checkbox">
//                     <span class="like-icon">★</span>
//                 </label>
//             </div>
//             <div class="card_bottom">
//                 <p class="card_title">${data.title}</p>
//                 <p class="card_subtitle">${data.place}</p>
//                 <p class="card_subtitle">${data.startDate} ~ ${data.endDate}</p>
//             </div>
//         </div>
//     `;
//
//     return li;
// }

function loadExpo(list) {
    const ul = document.querySelector("#expo-list");
    ul.innerHTML = '';

    if (!Array.isArray(list)) return;

    list.forEach(data => {
        const card = createExpoCard(data);
        ul.appendChild(card);
    });
}