import { dialogHandler } from '../index.js';
import { loadMovies } from './movie.js';
import { loadRecords } from './storage.js';

const $loginContainer = document.getElementById("login-container");
const $loginPage = $loginContainer.querySelector('.login-page');
const $loginForm = $loginContainer.querySelector('.login-form');
const $signupBtn = $loginContainer.querySelector('.signup-button');
const $signupPage = $loginContainer.querySelector('.signup-page');
const $signupForm = $loginContainer.querySelector('.signup-form');
const $closeButton = $loginContainer.querySelector('.close-button');
const $menuContainer = document.getElementById("menu-container");
const $logoutBtn = $menuContainer.querySelector('.button.logout');
const $updateBtn = $menuContainer.querySelector('.button.update');

//로그인 모달 창 띄우기
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedEmail = localStorage.getItem('rememberedEmail');
    const rememberCheckbox = document.getElementById('remember-email');
    const emailInput = document.getElementById('email');

    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }

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
    const rememberEmail = document.getElementById('remember-email').checked;

    if (!storedUser){
        dialogHandler.showSimpleOk('이메일을 다시 확인해주세요.');
        return;
    }

    //저장 되어있던 유저 정보 가져와 DOM 형태로 만듦
    const userDate = JSON.parse(storedUser);

    if (userDate.password === password){
        if (rememberEmail) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', email);
        $loginPage.classList.add('slide-out');

        setTimeout(() => {
            $loginContainer.classList.remove('visible');
            $loginPage.classList.remove('visible', 'slide-out');

            // 현재 기록 탭에 있다면 새로고침
            const recordContainer = document.getElementById('record-container');
            if (recordContainer && recordContainer.style.display === 'block') {
                loadRecords();
            } else {
                loadMovies();
            }
        }, 500); // 애니메이션 시간과 동일

    } else{
        dialogHandler.showSimpleOk('이메일 및 비밀번호를 잘못 입력하셨습니다.');
    }
    $loginPage.querySelector('#password').value = "";
});

//로그아웃 기능
function logout() {
    const currentUser = localStorage.getItem('currentUser');

    //로그인 상태 초기화
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');

    // 기록/즐겨찾기 컨테이너 초기화
    const $recordList = document.querySelector('#record-list');
    const $bookmarkList = document.querySelector('#bookmark-list');
    if ($recordList) {
        $recordList.innerHTML = `
            <div class="empty-state">
                <p>로그인 후 기록을 확인해주세요.</p>
            </div>
        `;
    }
    if ($bookmarkList) {
        $bookmarkList.innerHTML = `
            <div class="empty-state">
                <p>로그인 후 즐겨찾기를 확인해주세요.</p>
            </div>
        `;
    }

    // 영화 탭으로 강제 이동
    const movieRadio = document.querySelector('input[name="categoryTab"][value="영화"]');
    if (movieRadio) {
        movieRadio.checked = true;
        movieRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }

    //로그인 페이지로 이동
    $loginContainer.classList.add('visible');
    $loginPage.classList.add('visible', 'slide-up');

    const savedEmail = localStorage.getItem('rememberedEmail');
    const emailInput = document.getElementById('email');
    const rememberCheckbox = document.getElementById('remember-email');

    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    } else {
        emailInput.value = "";
        rememberCheckbox.checked = false;
    }

    // 비밀번호 초기화
    $loginPage.querySelector('#password').value = "";

    setTimeout(() => {
        $loginPage.classList.remove('slide-up');
    }, 500);
}

$logoutBtn.addEventListener('click', () => {
    logout();
});

//회원가입 버튼 클릭 시 회원가입 모달 띄우기
$signupBtn.addEventListener('click', (e) => {
    e.preventDefault();

    $signupPage.querySelector('#signup-email').value = "";
    $signupPage.querySelector('#signup-password').value = "";
    $signupPage.querySelector('#signup-nickname').value = "";
    $signupPage.classList.add('visible', 'slide-up');

    setTimeout(() => {
        $signupPage.classList.remove('slide-up');
        $loginPage.classList.remove('visible');
    }, 500);
});

// 회원가입 모달에서 닫기 누르면 로그인 모달 띄우기
$closeButton.addEventListener('click', () => {
    $loginPage.classList.add('visible');

    $signupPage.classList.add('slide-down');

    setTimeout(() => {
        $signupPage.classList.remove('visible', 'slide-down');

        $loginPage.querySelector('#email').value = "";
        $loginPage.querySelector('#password').value = "";
    }, 500);
});

// 회원가입 모달에서 회원가입 클릭 시
$signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = $signupPage.querySelector('#signup-email').value.trim();
    const password = $signupPage.querySelector('#signup-password').value.trim();
    const nickname = $signupPage.querySelector('#signup-nickname').value.trim();

    //입력하지 않았을 때
    if (!email || !password || !nickname){
        dialogHandler.showSimpleOk('입력하지 않은 정보가 존재합니다.');
        return;
    }
    //이미 존재하는 아이디인지 확인
    if (localStorage.getItem(`email${email}`)){
        dialogHandler.showSimpleOk('이미 존재하는 아이디입니다.');
        return;
    }

    //회원정보 저장
    const userDate = {email, password, nickname};
    localStorage.setItem(`email${email}`, JSON.stringify(userDate));
    dialogHandler.showSimpleOk('회원가입이 완료되었습니다! 로그인 해주세요!');
    $loginPage.classList.add('visible');
    $signupPage.classList.add('slide-down');

    setTimeout(() => {
        $signupPage.classList.remove('visible', 'slide-down');

        $loginPage.querySelector('#email').value = "";
        $loginPage.querySelector('#password').value = "";
    }, 500);
});

// auth.js 파일에 추가할 코드

const $updatePanel = document.getElementById('update-panel');
const $updateForm = $updatePanel.querySelector('.update-form');
const $cancelBtn = $updatePanel.querySelector('.cancel-btn');

// 정보수정 패널 열기
$updateBtn.addEventListener('click', () => {
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        dialogHandler.showSimpleOk('로그인이 필요합니다.');
        return;
    }

    const storedUser = localStorage.getItem(`email${currentUser}`);
    if (!storedUser) {
        dialogHandler.showSimpleOk('사용자 정보를 찾을 수 없습니다.');
        return;
    }

    const userData = JSON.parse(storedUser);

    // 현재 정보 표시
    $updatePanel.querySelector('#current-email').textContent = userData.email;
    $updatePanel.querySelector('#new-nickname').value = userData.nickname;
    $updatePanel.querySelector('#new-password').value = '';
    $updatePanel.querySelector('#confirm-password').value = '';

    // 패널 표시
    $updatePanel.classList.add('visible');
});

// 패널 닫기
function closeUpdatePanel() {
    $updatePanel.classList.remove('visible');
}

$cancelBtn.addEventListener('click', closeUpdatePanel);

// 정보수정 제출
$updateForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentUser = localStorage.getItem('currentUser');
    const storedUser = localStorage.getItem(`email${currentUser}`);
    const userData = JSON.parse(storedUser);

    const newPassword = $updatePanel.querySelector('#new-password').value.trim();
    const confirmPassword = $updatePanel.querySelector('#confirm-password').value.trim();
    const newNickname = $updatePanel.querySelector('#new-nickname').value.trim();

    // 닉네임 필수 체크
    if (!newNickname) {
        dialogHandler.showSimpleOk('닉네임을 입력해주세요.');
        return;
    }

    // 수정된 내용이 있는지 확인
    const isPasswordChanged = newPassword.length > 0 || confirmPassword.length > 0;
    const isNicknameChanged = newNickname !== userData.nickname;

    if (!isPasswordChanged && !isNicknameChanged) {
        dialogHandler.showSimpleOk('수정 할 정보가 없습니다.');
        return;
    }

    // 비밀번호 변경 시 확인
    if (isPasswordChanged) {
        if (newPassword !== confirmPassword) {
            dialogHandler.showSimpleOk('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (newPassword.length < 5) {
            dialogHandler.showSimpleOk('비밀번호는 최소 5자 이상이어야 합니다.');
            return;
        }

        // 비밀번호 업데이트
        userData.password = newPassword;
    }

    // 닉네임 업데이트
    userData.nickname = newNickname;

    // 저장
    localStorage.setItem(`email${currentUser}`, JSON.stringify(userData));

    dialogHandler.showSimpleOk('정보가 수정되었습니다.', {
        onclick: () => {
            // 기록 탭에 있다면 닉네임 업데이트를 위해 새로고침
            const recordContainer = document.getElementById('record-container');
            if (recordContainer && recordContainer.style.display === 'block') {
                loadRecords();
            }
        }
    });
    closeUpdatePanel();
});