import { createCardElement } from "../index.js";

const currentUser = localStorage.getItem('currentUser');

export function loadData(key){
    try {
        // 1. 키가 null이거나 정의되지 않은 경우
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
                <p>아직 작성된 문화 기록이 없습니다.</p>
                <p class="sub-text">영화, 도서, 전시/공연 탭에서 리뷰를 작성해보세요!</p>
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
}

function createRecordCard(record) {
    const { title, reviewData } = record;

    // 날짜 포맷팅
    const reviewDate = new Date(reviewData.timestamp);
    const formattedDate = `${reviewDate.getFullYear()}.${String(reviewDate.getMonth() + 1).padStart(2, '0')}.${String(reviewDate.getDate()).padStart(2, '0')}`;

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
                    <span class="rating-value my-rating">${reviewData.myRating ? '★ ' + reviewData.myRating : '미등록'}</span>
                </div>
                <div class="rating-item">
                    <span class="rating-label">평균 평점</span>
                    <span class="rating-value avg-rating">${reviewData.rating ? '★ ' + reviewData.rating : 'N/A'}</span>
                </div>
            </div>
            <div class="record-review">
                <p class="review-text">${reviewData.text}</p>
            </div>
            <div class="record-footer">
                <span class="review-date">${formattedDate}</span>
                <div class="record-actions">
                    <button class="btn-edit" data-key="${record.key}">수정</button>
                    <button class="btn-delete" data-key="${record.key}">삭제</button>
                </div>
            </div>
        </div>
    `;

    // 수정 버튼 이벤트
    const editBtn = card.querySelector('.btn-edit');
    editBtn.addEventListener('click', () => {
        editReview(record.key, title, reviewData);
    });

    // 삭제 버튼 이벤트
    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
        deleteReview(record.key);
    });

    return card;
}

function editReview(reviewKey, title, reviewData) {
    const $modal = dialogHandler.show({
        content: `
            <div class="edit-review-modal">
                <h3>${title}</h3>
                <textarea id="edit-review-text" class="review-textarea" placeholder="리뷰를 입력하세요">${reviewData.text}</textarea>
                <div class="rating-input">
                    <label>내 평점: </label>
                    <input type="number" id="edit-my-rating" min="0" max="10" step="0.1" 
                           value="${reviewData.myRating || ''}" placeholder="0.0 ~ 10.0">
                </div>
            </div>
        `,
        isContentHtml: true,
        buttons: [
            {
                caption: '저장',
                onclick: ($m) => {
                    const newText = document.getElementById('edit-review-text').value.trim();
                    const newRating = document.getElementById('edit-my-rating').value;

                    if (!newText) {
                        dialogHandler.showSimpleOk('리뷰 내용을 입력해주세요.');
                        return;
                    }

                    const updatedReview = {
                        ...reviewData,
                        text: newText,
                        myRating: newRating ? parseFloat(newRating) : null,
                        timestamp: new Date().toISOString()
                    };

                    localStorage.setItem(reviewKey, JSON.stringify(updatedReview));
                    dialogHandler.hide($m);
                    dialogHandler.showSimpleOk('리뷰가 수정되었습니다.', {
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

function deleteReview(reviewKey) {
    dialogHandler.show({
        content: '정말 이 리뷰를 삭제하시겠습니까?',
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