import { loadMovies } from "./index/movie.js";
import "./index/login.js";
import { loadGoogleBooksPage } from "./index/book.js";
import {loadExpo} from "./index/culture.js";

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
let expoLoaded = false;
// 메뉴 카테고리
const categoryInputs = document.querySelectorAll('input[name="categoryTab"]');
categoryInputs.forEach(input => {
    input.addEventListener('change', () => {
        const category = input.value;
        const list = document.querySelector('#poster-container .list')
        list.innerHTML = ''

        const expoList = document.querySelector('#expo-list');
        if (expoList) expoList.innerHTML = '';
        const poster = document.getElementById('poster-container');
        const expo = document.getElementById('expo-container');
        poster.style.display = 'none';
        expo.style.display = 'none';
        expo.classList.remove('active');

        if (category === '영화') {
            poster.style.display = 'block';
            loadMovies();
        }
        if (category === '도서') {
            poster.style.display = 'block';
            loadGoogleBooksPage();

        }  if (category === "전시/공연") {
            expo.style.display = "block";
            expo.classList.add("active");
            loadExpo();

        }
    });   // ← ★ 여기 빠졌던 괄호
});


// 카드 요소 만들기
export function createCardElement(data, type) {

    const li = document.createElement('li');
    li.classList.add('item');

    const card = document.createElement('article');
    card.classList.add('card', `card--${type}`);

    // 포스터
    const posterWrap = document.createElement('div');
    posterWrap.classList.add('card_poster');

    const img = document.createElement('img');
    img.src = data.image;
    img.alt = data.title || '';

    // 즐겨찾기
    const likeLabel = document.createElement('label');
    likeLabel.classList.add('card_like-label');

    const like = document.createElement('input');
    like.type = 'checkbox';
    like.classList.add('like-checkbox');

    const likeIcon = document.createElement('span');
    likeIcon.classList.add('like-icon');
    likeIcon.innerText = '★';

    likeLabel.appendChild(like);
    likeLabel.appendChild(likeIcon);

    posterWrap.appendChild(img);
    posterWrap.appendChild(likeLabel);

    const bottom = document.createElement('div');
    bottom.classList.add('card_bottom');

    /* ============================
       SCORE - 영화(movie)일 때만
    ============================= */
    if ((type === "movie" || type === "book") && data.score != null) {
        const score = document.createElement('div');
        score.classList.add('card_score');

        const scoreNum = document.createElement('span');
        scoreNum.classList.add('card_score-num');
        scoreNum.textContent = data.score;

        const scoreUnit = document.createElement('span');
        scoreUnit.classList.add('card_score-unit');
        scoreUnit.textContent = data.scoreUnit ?? '%';

        score.appendChild(scoreNum);
        score.appendChild(scoreUnit);

        bottom.appendChild(score);
    }
    /* ============================
        EXPO 전용: 지역 / serviceName
     ============================ */
    if (type === "expo") {
        const expoMeta = document.createElement('div');
        expoMeta.classList.add('expo_meta');

        if (data.area) {
            const area = document.createElement('p');
            area.classList.add('expo_area');
            area.textContent = data.area;
            expoMeta.appendChild(area);
        }

        if (data.serviceName) {
            const service = document.createElement('p');
            service.classList.add('expo_service');
            service.textContent = data.serviceName;
            expoMeta.appendChild(service);
        }

        bottom.appendChild(expoMeta);
    }
    // 메타데이터
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

    bottom.appendChild(meta);

    card.appendChild(posterWrap);
    card.appendChild(bottom);
    card.appendChild(description);
    li.appendChild(card);

    return li;
}





