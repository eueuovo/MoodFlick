import "./index/login.js";
import { loadGoogleBooksPage} from "./index/book.js";
import { loadExpo } from "./index/culture.js";
import {loadMovies, loadTop5Movies} from "./index/movie.js";
import "./index/filter.js";
import { loadRecords } from "./index/storage.js";

// 모달
export const dialogHandler = {
    $dialog: document.getElementById('dialog'),
    $modals: [],

    //모달 숨기기
    hide: ($modal) => {
        const index = dialogHandler.$modals.indexOf($modal);
        if (index > -1) dialogHandler.$modals.splice(index, 1);
        $modal.classList.remove('visible');

        const $backdrops = dialogHandler.$dialog.querySelectorAll('.modal-backdrop');
        if ($backdrops.length > 0) {
            $backdrops[$backdrops.length - 1].remove();
        }

        if (dialogHandler.$modals.length === 0)
            dialogHandler.$dialog.classList.remove('visible');
        else dialogHandler.$modals.at(-1).classList.remove('collapsed');

        setTimeout(() => $modal.remove(), 0);
    },

    //모달 보여주기
    show: (args) => {
        for (const $m of dialogHandler.$modals) $m.classList.add('collapsed');

        // 배경 레이어 추가 (모달이 2개 이상일 때만)
        if (dialogHandler.$modals.length > 0) {
            const $backdrop = document.createElement('div');
            $backdrop.classList.add('modal-backdrop');
            $backdrop.style.position = 'absolute';
            $backdrop.style.top = '0';
            $backdrop.style.left = '0';
            $backdrop.style.width = '100%';
            $backdrop.style.height = '100%';
            $backdrop.style.backgroundColor = '#21212190';
            $backdrop.style.backdropFilter = 'blur(0.3rem)';
            $backdrop.style.zIndex = 10 + dialogHandler.$modals.length;
            dialogHandler.$dialog.append($backdrop);
        }

        const $modal = document.createElement('div');
        $modal.classList.add('modal');
/*
        const $title = document.createElement('div');
        $title.classList.add('title');
        $title.innerText = args.title;
        $modal.append($title);
*/

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

        $modal.style.zIndex = 10 + dialogHandler.$modals.length;

        dialogHandler.$dialog.append($modal);
        dialogHandler.$dialog.classList.add('visible');
        dialogHandler.$modals.push($modal);

        setTimeout(() => $modal.classList.add('visible'), 50);
        if (typeof args.onshow === 'function') args.onshow($modal);

        return $modal;
    },

    //간단한 확인 모달
    showSimpleOk: (/*title,*/ content, args = {}) =>
        dialogHandler.show({
            /*title,*/
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

// 탭 전환(포스터 및 필터)
const categoryInputs = document.querySelectorAll('input[name="categoryTab"]');
const filterSections = document.querySelectorAll('.filter-section');
const mainContainers = document.querySelectorAll('#poster-container.-stretch');
const filterContainer = document.querySelector('#filter-container');
const posterList = document.getElementById('poster-list'); // poster-list 선택
const pageBtn = document.getElementById('page-container')//페이지 버튼
const search = document.getElementById('book-search')
const wrapper = document.getElementById('wrapper');



posterList.innerHTML = ''; // 포스터 초기화


categoryInputs.forEach(input => {
    input.addEventListener('change', () => {
        const category = input.value;

        // 기록 컨테이너 숨기기
        const recordContainer = document.getElementById('record-container');
        if (recordContainer) recordContainer.style.display = 'none';

        // 필터랑 스플래시 기록 탭 아닐때 보이게
        const filterWrapper = document.querySelector('#filter-wrapper');
        const splashContainer = document.querySelector('#splash-container');

        if (category === '기록') {
            // 기록 탭: 필터와 스플래시 숨기기
            if (filterWrapper) filterWrapper.style.display = 'none';
            if (splashContainer) splashContainer.style.display = 'none';
        } else {
            // 다른 탭: 필터와 스플래시 보이기
            if (filterWrapper) filterWrapper.style.display = 'block';
            if (splashContainer) splashContainer.style.display = 'block';
        }

        // 필터 전환
        filterSections.forEach(section => section.style.display = 'none');
        const active = document.querySelector(`.filter-section[data-tab="${input.value}"]`);
        if (active) active.style.display = 'block';

        //포스터 초기화
        const list = document.querySelector('#poster-container .list')
        list.innerHTML = ''

        /*const expoList = document.querySelector('#expo-list');
        if (expoList) expoList.innerHTML = '';*/
        const poster = document.getElementById('poster-container');
        /*const expo = document.getElementById('expo-container');*/
        /*poster.style.display = 'none';*/
     /*   expo.style.display = 'none';
        expo.classList.remove('active');*/

        //스플래시
        const splashSections = document.querySelectorAll('.movie-main');
        splashSections.forEach(s => s.classList.remove('active'));
        const activeSplash = document.querySelector(`.movie-main[data-tab="${category}"]`);
        if (activeSplash) {
            activeSplash.classList.add('active');
            updateSplashHeight();
        }

        //메인 컨테니어 전환
        mainContainers.forEach(container => container.style.display = 'none');
        const posterContainerActive = document.querySelector(`#poster-container[data-tab="${category}"]`);
        if (posterContainerActive) {
            posterContainerActive.style.display = 'block';
        }

        //카테고리별 함수 호출
        if (category === '영화') {
           poster.style.display = 'block';
            filterContainer.style.display = 'block';
            posterList.style.transform = 'translateX(0)'; // 원래 위치
            pageBtn.style.transform = 'translateX(0)'; // 페이지 버튼 원위치
            loadMovies();
            loadTop5Movies();
        } if (category === '도서') {
            filterContainer.style.display = 'none';
            posterList.style.transform = 'translateX(-5rem)';
            pageBtn.style.transform = 'translateX(-7rem)'; // 필터 넓이만큼 왼쪽 이동
            search.style.display='block';
            poster.style.display = 'block';
            loadGoogleBooksPage();
        } if (category === "전시/공연") {
            filterContainer.style.display = 'none';
            posterList.style.transform = 'translateX(-5rem)';
            pageBtn.style.transform = 'translateX(-7rem)'; // 필터 넓이만큼 왼쪽 이동
            search.style.display='block';
            poster.style.display = "block";  // 영화/도서랑 동일하게 사용
            loadExpo();                     // ★ 반드시 실행됨
        } if (category === "기록"){
            poster.style.display = 'none';
            loadRecords();
        }
    });
});

// 스플래시 전환
function initSplashAutoSlide() {
    const splashContainers = document.querySelectorAll('.splash');

    splashContainers.forEach(container => {
        const images = Array.from(container.querySelectorAll('.img'));
        if (!images.length) return;

        let currentIndex = 0;

        images.forEach((img, idx) => {
            img.style.transition = 'none';
            img.style.left = idx === 0 ? '0' : '100%';
        });

        setInterval(() => {
            const prevIndex = currentIndex;
            const nextIndex = (currentIndex + 1) % images.length;

            // 현재 이미지 왼쪽으로
            images[prevIndex].style.transition = 'left 0.5s ease-in-out';
            images[prevIndex].style.left = '-100%';

            // 다음 이미지 중앙으로
            images[nextIndex].style.transition = 'left 0.5s ease-in-out';
            images[nextIndex].style.left = '0';

            // 나머지 이미지들은 확실히 오른쪽에 고정
            images.forEach((img, idx) => {
                if (idx !== prevIndex && idx !== nextIndex) {
                    img.style.transition = 'none';
                    img.style.left = '100%';
                }
            });

            // 애니메이션 끝나면 이전 이미지 리셋
            setTimeout(() => {
                images[prevIndex].style.transition = 'none';
                images[prevIndex].style.left = '100%';
            }, 1100);

            currentIndex = nextIndex;
        }, 3000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initSplashAutoSlide();
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

    //즐찾 클릭 시 이벤트 막기
    likeLabel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // HEAD 스타일 유지
    const like = document.createElement('input');
    like.type = 'checkbox';
    like.classList.add('like-checkbox');

    // 즐겨찾기 key
    const favKey = `favorite_movie_${data.id}`;

    // 즐겨찾기 localStorage
    if (localStorage.getItem(favKey)) {
        like.checked = true;
    }

    // 즐겨찾기 추가 클릭
    like.addEventListener('change', (e) => {
        e.stopPropagation();

        if (like.checked) {
            localStorage.setItem(favKey, JSON.stringify(data));
        } else {
            localStorage.removeItem(favKey);
        }
    });

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

    card.addEventListener('click', () => {
        const currentUser = localStorage.getItem('currentUser');

        if (!currentUser){
            dialogHandler.showSimpleOk('로그인이 필요합니다.');
            return;
        }

        const reviewKey = `review_${currentUser}_${data.title}`;
        const reviewData = localStorage.getItem(reviewKey);
        const existingReview = reviewData ? JSON.parse(reviewData) : null;

        const reviewButtons = existingReview
            ? `<button id="review-edit">수정</button>
               <button id="review-delete">삭제</button>`
            : `<button id="review-submit">등록</button>`;

        const $modal = dialogHandler.show({
            title: '',
            content: `
            <div class="modal-content">
                <div class="modal-poster">
                    <img src="${data.image}" alt="${data.title}">
                </div>
                <div class="modal-info">
                    <div class="title-wrapper">
                        <div class="title">${data.title}</div>
                        <div class="info-row">
                            <div class="subtitle">개봉일 ${data.subtitle ?? ''}</div>                                            
                            <div class="grade">평점: ${data.score ?? '–'}${data.scoreUnit ?? ''}</div>
                        </div>
                    </div>
                    <div class="description">${data.fullDescription ?? ''}</div>
                    <div class="review-section">
                        <label class="review-wrapper">
                            <div class="rating-wrapper">
                                <div class="stars" id="review-stars">
                                    <span class="star-caption">내가 준 점수</span>
                                    <!-- 0.5점 단위 = 10칸 -->
                                    <span class="star" data-index="0"></span>
                                    <span class="star" data-index="1"></span>
                                    <span class="star" data-index="2"></span>
                                    <span class="star" data-index="3"></span>
                                    <span class="star" data-index="4"></span>
                                </div>
                            </div>
                            <textarea id="review-input" class="review-input"
                            placeholder="리뷰를 입력하세요"
                            ${existingReview ? 'readonly' : ''} 
                            style="${existingReview ? 'background-color: #f3f4f6; cursor: default;' : ''}"
                            >${existingReview?.text ?? ''}</textarea>
                        </label>
                        <div class="button-wrapper">
                            ${reviewButtons}
                        </div>
                    </div>
                </div>
            </div>
            `,
            isContentHtml: true,
            buttons: [
                {
                    caption: '닫기',
                    onclick: ($m) => dialogHandler.hide($m)
                }
            ]
        })

        // =================별점 기능==================== //
        const starsWrap = $modal.querySelector('#review-stars');
        const stars = $modal.querySelectorAll('.star');
        let state = [0, 0, 0, 0, 0];
        // 0 = empty, 0.5 = half, 1 = full
        let selectedRating = 0;

        function renderStars() {
            selectedRating = 0;
            // star : 반복 중인 현재 값 i: 반복 횟수(현재 index)
            stars.forEach((star, i) => {
                star.classList.remove('full', 'half');

                if (state[i] === 1) star.classList.add('full');
                else if (state[i] === 0.5) star.classList.add('half');

                selectedRating += state[i];
            });
        }

        if (existingReview) {
            const savedRating = existingReview.star ?? 0;

            state = [0, 0, 0, 0, 0];
            const full = Math.floor(savedRating);
            for (let i = 0; i < full; i++) state[i] = 1;
            if (savedRating % 1 !== 0 && full < state.length) {
                state[full] = 0.5;
            }

            renderStars();                       // 별 모양 반영
            starsWrap.classList.add('disabled'); // 수정 누르기 전까지 잠금
        }

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const index = Number(star.dataset.index);
                // 현재 상태에 따라 변환
                if (state[index] === 0) {
                    state[index] = 0.5;
                } else if (state[index] === 0.5) {
                    state[index] = 1;
                } else {
                    state[index] = 0;
                }

                // 왼쪽 별들은 항상 full
                for (let i = 0; i < index; i++) {
                    state[i] = 1;
                }

                // 오른쪽 별들은 항상 empty
                for (let i = index + 1; i < 5; i++) {
                    state[i] = 0;
                }
                renderStars();
            });
        });

        const reviewInput = $modal.querySelector('#review-input');

        //리뷰 등록 (리뷰 없을때)
        const submitBtn = $modal.querySelector('#review-submit');
        if (submitBtn){
            submitBtn.addEventListener('click', () => {
                const reviewText = reviewInput.value.trim();

                if (selectedRating === 0) {
                    dialogHandler.showSimpleOk('별점을 선택해주세요.');
                    return;
                }

                if (!reviewText) {
                    dialogHandler.showSimpleOk('리뷰 내용을 입력해주세요.');
                    return;
                }

                starsWrap.classList.add('disabled');   // ★ 등록 후 별점 잠금
                const reviewData = {
                    star : selectedRating,
                    text: reviewText,
                    author: currentUser,
                    timestamp: new Date().toISOString(),
                    contentImage: data.image,
                    contentSubtitle: data.subtitle ?? '',
                    rating: data.score ?? null
                };
                localStorage.setItem(reviewKey, JSON.stringify(reviewData));
                dialogHandler.showSimpleOk('리뷰가 등록되었습니다.', {
                    onclick: () => {
                        // 모달 닫고 다시 열기
                        dialogHandler.hide($modal);
                        setTimeout(() => card.click(), 100);
                    }
                });
            });
        }
        //수정 버튼
        const editBtn = $modal.querySelector('#review-edit');
        if (editBtn) {
            let isEditing = false;

            editBtn.addEventListener('click', () => {
                if (!isEditing) {
                    // 수정 모드 활성화
                    starsWrap.classList.remove('disabled');
                    reviewInput.removeAttribute('readonly');
                    reviewInput.style.backgroundColor = '';
                    reviewInput.style.cursor = '';
                    reviewInput.focus();
                    editBtn.textContent = '완료';
                    isEditing = true;
                } else {
                    // 수정 완료
                    const reviewText = reviewInput.value.trim();

                    if (selectedRating === 0) {
                        dialogHandler.showSimpleOk('별점을 선택해주세요.');
                        return;
                    }

                    if (!reviewText) {
                        dialogHandler.showSimpleOk('리뷰 내용을 입력해주세요.');
                        return;
                    }

                    starsWrap.classList.add('disabled');  // ★ 다시 잠금

                    const reviewData = {
                        star : selectedRating,
                        text: reviewText,
                        author: currentUser,
                        timestamp: new Date().toISOString()
                    };
                    localStorage.setItem(reviewKey, JSON.stringify(reviewData));
                    dialogHandler.showSimpleOk('리뷰가 수정되었습니다.', {
                        onclick: () => {
                            dialogHandler.hide($modal);
                            setTimeout(() => card.click(), 100);
                        }
                    });
                    isEditing = false;
                }
            });
        }
        //리뷰 삭제 (리뷰 있을 때)
        const deleteBtn = $modal.querySelector('#review-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (existingReview.author !== currentUser) {
                    dialogHandler.showSimpleOk('본인이 작성한 리뷰만 삭제 가능합니다.');
                    return;
                }

                localStorage.removeItem(reviewKey);
                dialogHandler.showSimpleOk('리뷰가 삭제되었습니다.', {
                    onclick: () => {
                        dialogHandler.hide($modal);
                        setTimeout(() => card.click(), 100);
                    }
                });
            });
        }
    });
    return li;
}

// =================필터 기능==================== //
document.querySelector(".filter-search-btn").addEventListener("click", loadMovies);

// =================스플래시 크기 변경================= //
function updateSplashHeight() {
    const splashContainer = document.querySelector('#splash-container');
    const activeSplash = document.querySelector('.movie-main.active');

    if (!activeSplash || !splashContainer) return;

    splashContainer.style.height = activeSplash.offsetHeight + 'px';
}
window.addEventListener('resize', updateSplashHeight);
window.addEventListener('load', updateSplashHeight);

loadMovies();
loadTop5Movies();