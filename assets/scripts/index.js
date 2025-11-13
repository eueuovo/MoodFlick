// 알라딘 API 연결
const fetchBook = () => {
    const proxy = "https://cors-anywhere.herokuapp.com/";
    const url = "https://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=ttbehgml10730857001&QueryType=Bestseller&MaxResults=3&start=1&SearchTarget=Book&output=js&Version=20131101";

    fetch(proxy + url)
        .then(res => res.text()) // JSON 대신 텍스트로 받기
        .then(txt => console.log("응답", txt))
        .catch(err => console.error("오류", err));
}


const fetchMusic = (query) => {
    const apiKey = "4f438fd7a7cfa2dfae9f08f0b51095bb";
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${apiKey}&format=json`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log("검색 결과:", data.results.artistmatches.artist);
        })
        .catch(err => console.error(err));
};

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