import { loadMovies } from "./index/movie.js";
import "./index/login.js";
import { loadGoogleBooksPage } from "./index/book.js";

// 모달
export const dialogHandler = {
    $dialog: document.getElementById('dialog'),
    $modals: [],

    //모달 숨기기
    hide: ($modal) => {
        const index = dialogHandler.$modals.indexOf($modal);
        if (index > -1) dialogHandler.$modals.splice(index, 1);
        $modal.classList.remove('visible');
        if (dialogHandler.$modals.length === 0)
            dialogHandler.$dialog.classList.remove('visible');
        else dialogHandler.$modals.at(-1).classList.remove('collapsed');

        setTimeout(() => $modal.remove(), 0);
    },

    //모달 보여주기
    show: (args) => {
        for (const $m of dialogHandler.$modals) $m.classList.add('collapsed');
        const $modal = document.createElement('div');
        $modal.classList.add('modal');

        const $title = document.createElement('div');
        $title.classList.add('title');
        $title.innerText = args.title;
        $modal.append($title);

        const $content = document.createElement('div');
        $content.classList.add('content');
        if (args.isContentHtml) $content.innerHTML = args.content;
        else $content.innerText = args.content;
        $modal.append($content);

        if (args.buttons?.length){
            const $btnContainer = document.createElement('div');
            $btnContainer.classList.add('button-container');
            args.buttons.forEach((btn) => {
                const $b = document.createElement('button');
                $b.classList.add('button');
                $b.type = 'button';
                $b.innerText = btn.caption;
                if (typeof btn.onclick === 'function')
                    $b.addEventListener('click', () => btn.onclick($modal));
                $btnContainer.append($b);
            });
            $modal.append($btnContainer);
        }

        dialogHandler.$dialog.append($modal);
        dialogHandler.$dialog.classList.add('visible');
        dialogHandler.$modals.push($modal);

        setTimeout(() => $modal.classList.add('visible'), 50);
        if (typeof args.onshow === 'function') args.onshow($modal);

        return $modal;
    },

    //간단한 확인 모달
    showSimpleOk: (title, content, args = {}) =>
        dialogHandler.show({
            title,
            content,
            isContentHtml: args.isContentHtml,
            buttons: [
                {
                    caption: args.okCaption ?? '확인',
                    onclick: ($modal) => {
                        dialogHandler.hide($modal);
                        if (typeof args.onclick === 'function')
                            args.onclick($modal);
                    },
                },
            ],
        }),
};

// 메뉴 카테고리
const categoryInputs = document.querySelectorAll('input[name="categoryTab"]');
categoryInputs.forEach(input => {
    input.addEventListener('change', () => {
        const category = input.value;
        const list = document.querySelector('#poster-container .list')
        list.innerHTML= ''

        const expoList = document.querySelector('#expo-list');
        if (expoList) expoList.innerHTML = '';
        const poster = document.getElementById('poster-container');
        const expo = document.getElementById('expo-container');
        poster.style.display = 'none';
        expo.style.display = 'none';

        if (category === '영화') {
            poster.style.display = 'block';
            loadMovies();
        } if (category === '도서'){
            poster.style.display = 'block';
            loadGoogleBooksPage();
        }if(category === '전시/공연'){
            expo.style.display = 'block';
            fetchCultural()
                .then(renderExpo)   // XML 파싱
                .then(loadExpo)     // 화면에 렌더
                .catch(err => console.error(err));
        }
    });
});

// 카드 요소 만들기
export function createCardElement(data, type) {
    const li = document.createElement('li');
    li.classList.add('item');

    const card = document.createElement('article');
    card.classList.add('card', `card--${type}`);

    //포스터
    const posterWrap = document.createElement('div');
    posterWrap.classList.add('card_poster');

    const img = document.createElement('img');
    img.src = data.image;
    img.alt = data.title || '';

    //즐겨찾기
    const likeLabel = document.createElement('label');
    likeLabel.classList.add('card_like-label');

    // HEAD 스타일 유지
    const like = document.createElement('input');
    like.type = 'checkbox';
    like.classList.add('like-checkbox');

    const likeIcon = document.createElement('span');
    likeIcon.classList.add('like-icon');
    likeIcon.innerText = '★'; // sh 버전의 아이콘 표시 추가

    likeLabel.appendChild(like);
    likeLabel.appendChild(likeIcon);

    posterWrap.appendChild(img);
    posterWrap.appendChild(likeLabel);

    const bottom = document.createElement('div');
    bottom.classList.add('card_bottom');

    const score = document.createElement('div');
    score.classList.add('card_score');

    const scoreNum = document.createElement('span');
    scoreNum.classList.add('card_score-num');
    scoreNum.textContent = data.score ?? '–';

    const scoreUnit = document.createElement('span');
    scoreUnit.classList.add('card_score-unit');
    scoreUnit.textContent = data.scoreUnit ?? '%';

    score.appendChild(scoreNum);
    score.appendChild(scoreUnit);

    const meta = document.createElement('div');
    meta.classList.add('card_meta');

    const title = document.createElement('p');
    title.classList.add('card_title');
    title.textContent = data.title;

    const subtitle = document.createElement('p');
    subtitle.classList.add('card_subtitle');
    subtitle.textContent = data.subtitle ?? '';

    const description = document.createElement('div');
    description.classList.add('card_description');
    description.textContent = data.description ?? '';

    meta.appendChild(title);
    meta.appendChild(subtitle);

    bottom.appendChild(score);
    bottom.appendChild(meta);

    card.appendChild(posterWrap);
    card.appendChild(bottom);
    card.appendChild(description);
    li.appendChild(card);

    return li;
}

// 관람 전시 api api 가져오기
const fetchCultural = () => {
    const url = new URL('https://apis.data.go.kr/B553457/cultureinfo/period2');
    url.searchParams.set('serviceKey', '89YiOxOkyK6UlZ801yXmfUJP0oT9U6f6YMbAycEXoblUG1jvQbXfWFNgXwMGNWjHkGXhIA/JjY/M2cCOURanpQ==');
    url.searchParams.set('numOfRows', '10');
    url.searchParams.set('pageNo', '');
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
// 2. XML 파싱 + 데이터 가공
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
    const list = document.getElementById("poster-list");
    list.style.padding = "1.5rem 0";
}
function loadExpo(list) {
    const ul = document.querySelector("#expo-list");
    ul.innerHTML = '';

    if (!Array.isArray(list)) return;

    list.forEach(data => {
        const card = createExpoCard(data);
        ul.appendChild(card);
    });
}

/*// 3. 화면에 표시하기 (load 역할)
function loadExpo(list) {
    const ul = document.querySelector("#expo-list");
    ul.innerHTML = '';

    // list가 없거나 배열이 아니면 그냥 비우고 종료
    if (!Array.isArray(list)) return;

    list.forEach(data => {
        const li = document.createElement("li");
        li.classList.add("expo-item");

        li.innerHTML = `
            <div class="expo-thumb">
                <img src="${data.thumbnail}" alt="">
                <span class="expo-badge">${data.realName}</span>
            </div>
            <div class="expo-info">
                <p class="expo-title">${data.title}</p>
                <p class="expo-place">${data.place}</p>
                <p class="expo-date">${data.startDate} ~ ${data.endDate}</p>
            </div>
        `;

        ul.appendChild(li);
    });
}*/

function createExpoCard(data) {
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