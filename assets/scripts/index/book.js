// 도서 렌더링
function renderBooks(items) {
    const list = document.querySelector('#poster-container .list');
    list.innerHTML = '';
    const frag = document.createDocumentFragment();

    items.forEach(b => {
        const cardData = {
            image: b.cover || 'assets/images/no-poster.png',
            title: b.title,
            subtitle: `${b.author || ''} · ${b.pubDate || ''}`,
            score: b.userRating ?? '★',
            scoreUnit: '',
        };
        frag.appendChild(createCardElement(cardData, 'book'));
    });

    list.appendChild(frag);
}

// googleBook API 연결
const googleBook = {
    API_KEY: "AIzaSyCNbz5sSjh_AJ9buWD0QDSV_3m9nY1jyP4",
    BASE_URL: 'https://www.googleapis.com/books/v1/volumes'
};

let currentPage = 1;
const itemsPerPage = 10;
let totalItems = 0;

//페이지네이션
function  loadGoogleBooksPage(page = 1){
    currentPage = page;
    const startIndex = (page - 1) * itemsPerPage;
    const url = `https://www.googleapis.com/books/v1/volumes?q=베스트셀러&key=AIzaSyCNbz5sSjh_AJ9buWD0QDSV_3m9nY1jyP4&maxResults=${itemsPerPage}&startIndex=${startIndex}&langRestrict=ko`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            totalItems = data.totalItems || 0;
            if (!data.items || data.items.length === 0){
                console.log("데이터 없음");
                return;
            }
            renderGoogleBooks(data.items);
            /*
                        renderPagination();
            */
        })
        .catch(err => console.error("구글 북스 api 오류", err));
}

//도서 랜더링
function renderGoogleBooks(items) {
    const list = document.querySelector('#poster-container .list');
    list.innerHTML = '';
    const frag = document.createDocumentFragment();

    items.forEach(b => {
        const volumeInfo = b.volumeInfo;
        const cardData = {
            image: volumeInfo.imageLinks?.thumbnail || 'assets/images/index/main/no-poster.png',
            title: volumeInfo.title,
            subtitle: `${volumeInfo.authors?.join(", ") || ""} · ${volumeInfo.publishedDate || ""}`,
            score: volumeInfo.averageRating ?? '★',
            scoreUnit: '',
            description: volumeInfo.description?.substring(0, 70) + '...' || ''
        };
        frag.appendChild(createCardElement(cardData, 'book'));
    });
    list.appendChild(frag);
}

//페이지 버튼 렌더링
/*function renderPagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === currentPage) btn.disabled = true;
        btn.addEventListener('click', () => loadGoogleBooksPage(i));
        paginationContainer.appendChild(btn);
    }
}*/

