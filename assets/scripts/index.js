// 알라딘 API 연결
const fetchBook = () => {
    const proxy = "https://cors-anywhere.herokuapp.com/";
    const url = "https://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=ttbehgml10730857001&QueryType=Bestseller&MaxResults=3&start=1&SearchTarget=Book&output=js&Version=20131101";

    fetch(proxy + url)
        .then(res => res.text()) // JSON 대신 텍스트로 받기
        .then(txt => console.log("응답", txt))
        .catch(err => console.error("오류", err));
}

/*const fetchMusic = (query) => {
    const apiKey = "4f438fd7a7cfa2dfae9f08f0b51095bb";
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${apiKey}&format=json`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log("검색 결과:", data.results.artistmatches.artist);
        })
        .catch(err => console.error(err));
};*/

// 영화 API 연결
const fetchMovie = () => {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZDk3N2IxMzc3MDEyODFmZTZkODgyODRkOTQwMWJhYiIsIm5iZiI6MTc2MjkzNDUyNC4yNTksInN1YiI6IjY5MTQzZWZjYTg5NmE4YmIyMmEwZDVlOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-4iLUKsWiA980JV4odv6lTds6LZbouyBPNmmV8dG8Uw'
        }
    };
    fetch('https://api.themoviedb.org/3/configuration', options)
        .then(res => res.json())
        .then(res => console.log(res))
        .catch(err => console.error(err));
};

const fetchCultural = () => {
    const xhr = new XMLHttpRequest();
    const url = new URL('https://apis.data.go.kr/B553457/cultureinfo/period2');
    url.searchParams.set('serviceKey', '89YiOxOkyK6UlZ801yXmfUJP0oT9U6f6YMbAycEXoblUG1jvQbXfWFNgXwMGNWjHkGXhIA/JjY/M2cCOURanpQ==');
    url.searchParams.set(numOfRows, '50');
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('resultType', 'json');
    xhr.onreadystatechange = () => {
        if(xhr.readyState !== XMLHttpRequest.DONE){
            return;
        }
        if(xhr.status < 200 || xhr.status >= 400){
            console.log('공연정보 불러오기 실패');
            return;
        }
        console.log('성공');
    };
    xhr.open('GET', url);
    xhr.send();
}

//모달
const dialogHandler = {
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