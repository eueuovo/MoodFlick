const $loginContainer = document.getElementById("login-container");
const $loginPage = $loginContainer.querySelector('.login-page');
const $loginForm = $loginContainer.querySelector('.login-form');
const $loginBtn = $loginContainer.querySelector('.login-button');
const $signupBtn = $loginContainer.querySelector('.signup-button');
const $signupPage = $loginContainer.querySelector('.signup-page');
const $signupForm = $loginContainer.querySelector('.signup-form');
const $signupSubmitBtn = $loginContainer.querySelector('.signup-submit-button');
const $closeButton = $loginContainer.querySelector('.close-button');
const $menuContainer = document.getElementById("menu-container");
const $logoutBtn = $menuContainer.querySelector('.button.logout');
const $myPageBtn = $menuContainer.querySelector('.button.my-page');

//로그인 모달 창 띄우기
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn){
        //이미 로그인 된 상태
        $loginContainer.classList.remove('visible');
        $loginPage.classList.remove('visible');
    } else{
        $loginContainer.classList.add('visible');
        $loginPage.classList.add('visible');
    }
});

//로그인 클릭 시
$loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = $loginForm.querySelector('#email').value.trim();
    const password = $loginForm.querySelector('#password').value.trim();
    const storedUser = localStorage.getItem(`email${email}`);

    if (!storedUser){
        dialogHandler.showSimpleOk('경고', '이메일을 다시 확인해주세요.');
        return;
    }

    //저장 되어있던 유저 정보 가져와 DOM 형태로 만듦
    const userDate = JSON.parse(storedUser);

    if (userDate.password === password){
        dialogHandler.showSimpleOk('알림', ` 로그인 되었습니다.`);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', email);
        $loginContainer.classList.remove('visible');
        $loginPage.classList.remove('visible');
        loadMovies();
    } else{
        dialogHandler.showSimpleOk('경고', '이메일 및 비밀번호를 잘못 입력하셨습니다.');
    }
    $loginPage.querySelector('#email').value = "";
    $loginPage.querySelector('#password').value = "";
});

//로그아웃 기능
function logout() {
    const currentUser = localStorage.getItem('currentUser');

    //로그인 상태 초기화
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');

    //로그인 페이지로 이동
    $loginContainer.classList.add('visible');
    $loginPage.classList.add('visible');
}

$logoutBtn.addEventListener('click', () => {
    logout();
    dialogHandler.showSimpleOk('알림', '로그아웃 되었습니다.');
});

//회원가입 버튼 클릭 시 회원가입 모달 띄우기
$signupBtn.addEventListener('click', (e) => {
    e.preventDefault();

    $signupPage.querySelector('#signup-email').value = "";
    $signupPage.querySelector('#signup-password').value = "";
    $signupPage.querySelector('#signup-nickname').value = "";

    $loginPage.classList.remove('visible');
    $signupPage.classList.add('visible');
});

// 회원가입 모달에서 닫기 누르면 로그인 모달 띄우기
$closeButton.addEventListener('click', () => {
   $signupPage.classList.remove('visible');
   $loginPage.classList.add('visible');

   $loginPage.querySelector('#email').value = "";
   $loginPage.querySelector('#password').value = "";
});

// 회원가입 모달에서 회원가입 클릭 시
$signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = $signupPage.querySelector('#signup-email').value.trim();
    const password = $signupPage.querySelector('#signup-password').value.trim();
    const nickname = $signupPage.querySelector('#signup-nickname').value.trim();

    //입력하지 않았을 때
    if (!email || !password || !nickname){
        dialogHandler.showSimpleOk('주의', '입력하지 않은 정보가 존재합니다.');
        return;
    }
    //이미 존재하는 아이디인지 확인
    if (localStorage.getItem(`email${email}`)){
        dialogHandler.showSimpleOk('경고', '이미 존재하는 아이디입니다.');
        return;
    }

    //회원정보 저장 (JSON형태로 저장)
    const userDate = {email, password, nickname};
    localStorage.setItem(`email${email}`, JSON.stringify(userDate));

    dialogHandler.showSimpleOk('알림', '회원가입이 완료되었습니다! 로그인 해주세요!');
    $signupPage.classList.remove('visible');
    $loginPage.classList.add('visible');
});

//마이페이지 클릭
$myPageBtn.addEventListener('click', () =>{

});

