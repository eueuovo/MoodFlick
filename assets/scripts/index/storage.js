import { createCardElement, dialogHandler } from "../index.js";

const currentUser = localStorage.getItem('currentUser');

export function loadData(key){
    try {
        if (!key) {
            return null;
        }
        const serializedData = localStorage.getItem(key);
        if (serializedData === null) {
            return null;
        }
        return JSON.parse(serializedData);
    } catch (error) {
        console.error(`Error loading data from localStorage for key "${key}":`, error);
        return null;
    }
}

export function loadRecords() {

    const currentUser = localStorage.getItem('currentUser');

    //기록 탭 전용 컨테이너
    const $recordContainer = document.querySelector('#record-container');

    //없앨것들
    const $posterContainer = document.querySelector('#poster-container');
    const $filterWrapper = document.querySelector('#filter-wrapper');
    const $splashContainer = document.querySelector('#splash-container');

    //다른 요소 숨기기
    if ($posterContainer) $posterContainer.style.display = 'none';
    if ($filterWrapper) $filterWrapper.style.display = 'none';
    if ($splashContainer) $splashContainer.style.display = 'none';

    //기록 컨테이너 보이기
    if ($recordContainer) {
        $recordContainer.style.display = 'block';
    }

    // 탭과 섹션 초기화
    const recordTab = document.querySelector('.record-tab[data-record-tab="record"]');
    const bookmarkTab = document.querySelector('.bookmark-tab[data-record-tab="bookmark"]');
    const recordSection = document.querySelector('.record');
    const bookmarkSection = document.querySelector('.bookmark');

    // 모든 탭과 섹션 비활성화
    if (recordTab) recordTab.classList.remove('active');
    if (bookmarkTab) bookmarkTab.classList.remove('active');
    if (recordSection) recordSection.style.display = 'none';
    if (bookmarkSection) bookmarkSection.style.display = 'none';

    // 기록 탭 활성화
    if (recordTab) recordTab.classList.add('active');
    if (recordSection) recordSection.style.display = 'block';

    const $reviewList = document.querySelector('#record-list');

    if (!currentUser) {
        $reviewList.innerHTML = `
            <div class="empty-state">
                <p>로그인 후 기록을 확인해주세요.</p>
            </div>
        `;
        return;
    }

    // 사용자 프로필 가져오기
    const userProfile = loadData(`email${currentUser}`);
    const nickname = userProfile ? userProfile.nickname : currentUser;

    // 캡션 업데이트
    const $recordCaption = document.querySelector('#record-caption');
    if ($recordCaption) {
        $recordCaption.textContent = `${nickname}의 문화 기록`;
    }
    $reviewList.innerHTML = '';
    const records = [];

    // 로컬 스토리지에서 해당 사용자의 리뷰 찾기
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(`review_${currentUser}_`)) {
            try {
                const reviewData = loadData(key);
                const contentTitle = key.replace(`review_${currentUser}_`, '');

                if (reviewData) {
                    records.push({
                        key: key,
                        title: contentTitle,
                        reviewData: reviewData
                    });
                }
            } catch (e) {
                console.error(`리뷰 로드 오류 (키: ${key}):`, e);
            }
        }
    }
    // 날짜순 정렬 (최신순)
    records.sort((a, b) => {
        const dateA = new Date(a.reviewData.timestamp);
        const dateB = new Date(b.reviewData.timestamp);
        return dateB - dateA;
    });

    // 렌더링
    if (records.length === 0) {
        $reviewList.innerHTML = `
            <div class="empty-state">
                <div class="text">아직 작성된 문화 기록이 없습니다.</div>
                <div class="sub-text">영화, 도서, 전시/공연 탭에서 리뷰를 작성해보세요!</div>
            </div>
        `;
    } else {
        const frag = document.createDocumentFragment();
        records.forEach(record => {
            const recordCard = createRecordCard(record);
            frag.appendChild(recordCard);
        });
        $reviewList.appendChild(frag);
    }
    initRecordTabs();
}

//기록탭
function initRecordTabs() {
    const recordTab = document.querySelector('.record-tab[data-record-tab="record"]');
    const bookmarkTab = document.querySelector('.bookmark-tab[data-record-tab="bookmark"]');
    const recordSection = document.querySelector('.record');
    const bookmarkSection = document.querySelector('.bookmark');

    if (recordTab) {
        recordTab.addEventListener('click', () => {
            recordTab.classList.add('active');
            if (bookmarkTab) bookmarkTab.classList.remove('active');

            if (recordSection) recordSection.style.display = 'block';
            if (bookmarkSection) bookmarkSection.style.display = 'none';

            // 기록 탭으로 돌아올 때 초기화
            loadRecords();
        });
    }

    if (bookmarkTab) {
        bookmarkTab.addEventListener('click', () => {
            bookmarkTab.classList.add('active');
            if (recordTab) recordTab.classList.remove('active');

            if (bookmarkSection) bookmarkSection.style.display = 'block';
            if (recordSection) recordSection.style.display = 'none';

            loadBookmarks();
        });
    }
}

//즐찾탭
function loadBookmarks() {
    const currentUser = localStorage.getItem('currentUser');
    const $bookmarkList = document.querySelector('#bookmark-list');
    const $bookmarkCaption = document.querySelector('#bookmark-caption');

    if (!currentUser) {
        $bookmarkList.innerHTML = `
            <div class="empty-state">
                <p>로그인 후 즐겨찾기를 확인해주세요.</p>
            </div>
        `;
        return;
    }

    // 사용자 프로필 가져오기
    const userProfile = loadData(`email${currentUser}`);
    const nickname = userProfile ? userProfile.nickname : currentUser;

    // 캡션 업데이트
    if ($bookmarkCaption) {
        $bookmarkCaption.textContent = `${nickname}의 즐겨찾기`;
    }

    const bookmarks = [];

    // 로컬 스토리지에서 현재 사용자의 즐겨찾기만 찾기
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // 현재 사용자의 즐겨찾기만 필터링
        if (key && key.startsWith(`favorite_${currentUser}_`)) {
            try {
                const favoriteData = loadData(key);

                if (favoriteData) {
                    bookmarks.push({
                        key: key,
                        title: favoriteData.title || '제목 없음',
                        reviewData: {
                            contentImage: favoriteData.image || (favoriteData.poster_path
                                ? `https://image.tmdb.org/t/p/w500${favoriteData.poster_path}`
                                : 'assets/images/index/main/no-poster.png'),
                            star: favoriteData.star || null,
                            rating: favoriteData.rating || null,
                            memo: favoriteData.memo || '',
                            timestamp: favoriteData.timestamp || new Date().toISOString()
                        }
                    });
                }
            } catch (e) {
                console.error(`즐겨찾기 로드 오류 (키: ${key}):`, e);
            }
        }
    }

    // 날짜순 정렬 (최신순)
    bookmarks.sort((a, b) => {
        const dateA = new Date(a.reviewData.timestamp);
        const dateB = new Date(b.reviewData.timestamp);
        return dateB - dateA;
    });

    // 렌더링
    if (bookmarks.length === 0) {
        $bookmarkList.innerHTML = `
            <div class="empty-state">
                <div class="text">아직 즐겨찾기한 콘텐츠가 없습니다.</div>
                <div class="sub-text">마음에 드는 콘텐츠를 즐겨찾기 해보세요!</div>
            </div>
        `;
    } else {
        $bookmarkList.innerHTML = '';
        const frag = document.createDocumentFragment();
        bookmarks.forEach(bookmark => {
            const bookmarkCard = createBookmarkCard(bookmark);
            frag.appendChild(bookmarkCard);
        });
        $bookmarkList.appendChild(frag);
    }
}

// 즐겨찾기 카드 생성 함수
function createBookmarkCard(bookmark) {
    const { title, reviewData } = bookmark;

    const reviewDate = new Date(reviewData.timestamp);
    const formattedDate = `${reviewDate.getFullYear()}.${String(reviewDate.getMonth() + 1).padStart(2, '0')}.${String(reviewDate.getDate()).padStart(2, '0')}`;

    const card = document.createElement('article');
    card.classList.add('record-card');

    card.innerHTML = `
        <div class="record-poster">
            <img src="${reviewData.contentImage}" 
                 alt="${title}">
        </div>
        <div class="record-info">
            <div class="record-header">
                <h3 class="record-title">${title}</h3>
            </div>
            <div class="record-ratings">
                <div class="rating-item">
                    <span class="rating-label">내 평점</span>
                    <div class="rating-stars" data-type="my-rating">
                        <span class="star" data-index="0"></span>
                        <span class="star" data-index="1"></span>
                        <span class="star" data-index="2"></span>
                        <span class="star" data-index="3"></span>
                        <span class="star" data-index="4"></span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">평균 평점</span>
                    <span class="rating-value avg-rating">${reviewData.rating ? '★ ' + reviewData.rating : '-'}</span>
                </div>
            </div>
            <div class="record-review">
                <textarea class="review-text-edit" placeholder="메모를 입력하세요">${reviewData.memo || ''}</textarea>
            </div>
            <div class="record-footer">
                <span class="review-date">${formattedDate}에 등록한 기록</span>
                <div class="record-actions">
                    <button class="btn-save disabled" data-key="${bookmark.key}" disabled>저장</button>
                    <button class="btn-delete" data-key="${bookmark.key}">해제</button>
                </div>
            </div>
        </div>
    `;

    // 초기 값 저장
    const originalMemo = reviewData.memo || '';
    const originalStar = reviewData.star || 0;

    // 별점 렌더링
    const starsContainer = card.querySelector('.rating-stars');
    const stars = starsContainer.querySelectorAll('.star');
    let state = [0, 0, 0, 0, 0];
    let selectedRating = reviewData.star || 0;

    // 기존 별점 불러오기
    const savedRating = reviewData.star ?? 0;
    const full = Math.floor(savedRating);
    for (let i = 0; i < full; i++) state[i] = 1;
    if (savedRating % 1 !== 0 && full < state.length) {
        state[full] = 0.5;
    }

    function renderStars() {
        selectedRating = 0;
        stars.forEach((star, i) => {
            star.classList.remove('full', 'half');
            if (state[i] === 1) star.classList.add('full');
            else if (state[i] === 0.5) star.classList.add('half');
            selectedRating += state[i];
        });
    }

    renderStars();

    // 변경사항 확인 및 버튼 상태 업데이트
    const saveBtn = card.querySelector('.btn-save');
    const textarea = card.querySelector('.review-text-edit');

    function checkChanges() {
        const currentMemo = textarea.value.trim();
        const hasChanges = currentMemo !== originalMemo || selectedRating !== originalStar;

        if (hasChanges) {
            saveBtn.classList.remove('disabled');
            saveBtn.disabled = false;
        } else {
            saveBtn.classList.add('disabled');
            saveBtn.disabled = true;
        }
    }

    // 별 클릭 이벤트
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const index = Number(star.dataset.index);

            if (state[index] === 0) {
                state[index] = 0.5;
            } else if (state[index] === 0.5) {
                state[index] = 1;
            } else {
                state[index] = 0;
            }

            for (let i = 0; i < index; i++) {
                state[i] = 1;
            }
            for (let i = index + 1; i < 5; i++) {
                state[i] = 0;
            }
            renderStars();
            checkChanges();
        });
    });

    // 텍스트 변경 감지
    textarea.addEventListener('input', checkChanges);

    // 저장 버튼 이벤트
    saveBtn.addEventListener('click', () => {
        const newMemo = textarea.value.trim();

        const favoriteData = loadData(bookmark.key);
        const updatedFavorite = {
            ...favoriteData,
            memo: newMemo,
            star: selectedRating,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem(bookmark.key, JSON.stringify(updatedFavorite));
        dialogHandler.showSimpleOk('메모가 저장되었습니다.', {
            onclick: () => loadBookmarks()
        });
    });

    // 즐겨찾기 해제 버튼 이벤트
    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
        removeFavorite(bookmark.key);
    });

    return card;
}

// 즐겨찾기 해제 함수
function removeFavorite(favoriteKey) {
    dialogHandler.show({
        content: '즐겨찾기를 해제하시겠습니까?',
        buttons: [
            {
                caption: '해제',
                onclick: ($m) => {
                    localStorage.removeItem(favoriteKey);
                    dialogHandler.hide($m);
                    dialogHandler.showSimpleOk('즐겨찾기가 해제되었습니다.', {
                        onclick: () => loadBookmarks()
                    });
                }
            },
            {
                caption: '취소',
                onclick: ($m) => dialogHandler.hide($m)
            }
        ]
    });
}

function createRecordCard(record) {
    const { title, reviewData } = record;

    const reviewDate = new Date(reviewData.timestamp);
    const formattedDate = `${reviewDate.getFullYear()}.${String(reviewDate.getMonth() + 1).padStart(2,'0')}.${String(reviewDate.getDate()).padStart(2,'0')} ${String(reviewDate.getHours()).padStart(2,'0')}:${String(reviewDate.getMinutes()).padStart(2,'0')}`;

    const card = document.createElement('article');
    card.classList.add('record-card');

    card.innerHTML = `
        <div class="record-poster">
            <img src="${reviewData.contentImage || 'assets/images/index/main/no-poster.png'}" 
                 alt="${title}">
        </div>
        <div class="record-info">
            <div class="record-header">
                <h3 class="record-title">${title}</h3>
            </div>
            <div class="record-ratings">
                <div class="rating-item">
                    <span class="rating-label">내 평점</span>
                    <div class="rating-stars" data-type="my-rating">
                        <span class="star" data-index="0"></span>
                        <span class="star" data-index="1"></span>
                        <span class="star" data-index="2"></span>
                        <span class="star" data-index="3"></span>
                        <span class="star" data-index="4"></span>
                    </div>
                </div>
                <div class="rating-item">
                    <span class="rating-label">평균 평점</span>
                    <span class="rating-value avg-rating">${reviewData.rating ? '★ ' + reviewData.rating : '-'}</span>
                </div>
            </div>
            <div class="record-review">
                <textarea class="review-text-edit" placeholder="리뷰를 입력하세요">${reviewData.text}</textarea>
            </div>
            <div class="record-footer">
                <span class="review-date">${formattedDate}에 작성한 기록</span>
                <div class="record-actions">
                    <button class="btn-save disabled" data-key="${record.key}" disabled>저장</button>
                    <button class="btn-delete" data-key="${record.key}">삭제</button>
                </div>
            </div>
        </div>
    `;

    // 초기 값 저장
    const originalText = reviewData.text;
    const originalStar = reviewData.star || 0;

    // 별점 렌더링
    const starsContainer = card.querySelector('.rating-stars');
    const stars = starsContainer.querySelectorAll('.star');
    let state = [0, 0, 0, 0, 0];
    let selectedRating = reviewData.star || 0;

    // 기존 별점 불러오기
    const savedRating = reviewData.star ?? 0;
    const full = Math.floor(savedRating);
    for (let i = 0; i < full; i++) state[i] = 1;
    if (savedRating % 1 !== 0 && full < state.length) {
        state[full] = 0.5;
    }

    function renderStars() {
        selectedRating = 0;
        stars.forEach((star, i) => {
            star.classList.remove('full', 'half');
            if (state[i] === 1) star.classList.add('full');
            else if (state[i] === 0.5) star.classList.add('half');
            selectedRating += state[i];
        });
    }

    renderStars();

    // 변경사항 확인 및 버튼 상태 업데이트
    const saveBtn = card.querySelector('.btn-save');
    const textarea = card.querySelector('.review-text-edit');

    function checkChanges() {
        const currentText = textarea.value.trim();
        const hasChanges = currentText !== originalText || selectedRating !== originalStar;

        if (hasChanges) {
            saveBtn.classList.remove('disabled');
            saveBtn.disabled = false;
        } else {
            saveBtn.classList.add('disabled');
            saveBtn.disabled = true;
        }
    }

    // 별 클릭 이벤트
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const index = Number(star.dataset.index);

            if (state[index] === 0) {
                state[index] = 0.5;
            } else if (state[index] === 0.5) {
                state[index] = 1;
            } else {
                state[index] = 0;
            }

            for (let i = 0; i < index; i++) {
                state[i] = 1;
            }
            for (let i = index + 1; i < 5; i++) {
                state[i] = 0;
            }
            renderStars();
            checkChanges();
        });
    });

    // 텍스트 변경 감지
    textarea.addEventListener('input', checkChanges);

    // 저장 버튼 이벤트
    saveBtn.addEventListener('click', () => {
        const newText = textarea.value.trim();

        if (!newText) {
            dialogHandler.showSimpleOk('리뷰 내용을 입력해주세요.');
            return;
        }

        const updatedReview = {
            ...reviewData,
            text: newText,
            star: selectedRating,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem(record.key, JSON.stringify(updatedReview));
        dialogHandler.showSimpleOk('리뷰가 저장되었습니다.', {
            onclick: () => loadRecords()
        });
    });

    // 삭제 버튼 이벤트
    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
        deleteReview(record.key);
    });

    return card;
}

function deleteReview(reviewKey) {
    dialogHandler.show({
        content: '리뷰를 삭제하시겠습니까?',
        buttons: [
            {
                caption: '삭제',
                onclick: ($m) => {
                    localStorage.removeItem(reviewKey);
                    dialogHandler.hide($m);
                    dialogHandler.showSimpleOk('리뷰가 삭제되었습니다.', {
                        onclick: () => loadRecords()
                    });
                }
            },
            {
                caption: '취소',
                onclick: ($m) => dialogHandler.hide($m)
            }
        ]
    });
}