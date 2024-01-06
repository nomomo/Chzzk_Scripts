# CHZZK_sign_in_iframe

- 본 스크립트는 iframe(embed)로 삽입된 CHZZK 페이지에서 로그인이 유지되도록 해줍니다.
- 로그인이 유지되므로 iframe(embed)로 삽입된 CHZZK 페이지에서 연령 인증 스트림 시청, 채팅이 가능합니다.
- 로그인은 [chzzk.naver.com](https://chzzk.naver.com) 에서 직접해야 합니다.
- **본 스크립트는 Chrome 계열 브라우저의 경우 Tampermonkey Beta 버전에서만 동작합니다. (스크립트 매니저가 GM_cookie 기능을 지원해야 함)**

## 설치 방법

### STEP 1. Script Manager 설치

**Chrome 계열 브라우저의 경우 Tampermonkey Beta 버전에서만 작동합니다.** 아래 링크에서 Tampermonkey Beta 를 설치하세요.

기존 Tampermonkey 사용자도 Tampermonkey Beta 버전을 추가로 설치해야 합니다.

- Chrome - [Tampermonkey Beta](https://chromewebstore.google.com/detail/tampermonkey-beta/gcalenpjmijncebpfijmoaglllgpjagf)

### STEP 2. UserScript 설치

- 유저스크립트 관리 확장기능 설치 후 아래의 링크를 클릭하세요. 이후 뜨는 창에서 "설치" 버튼을 눌러 스크립트를 설치합니다.
  - [https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_sign_in_iframe/CHZZK_sign_in_iframe.user.js](https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_sign_in_iframe/CHZZK_sign_in_iframe.user.js)

이것으로 설치는 끝입니다. 즐겁게 사용하세요~

> 주의: 본 스크립트를 설치 및 사용하며 브라우저 과부하로 인한 응답 없음/뻗음으로 인한 데이터 손실, 보안 이슈, 기타 발생하는 다른 문제에 대하여 개발자는 책임지지 않음(보고된 문제는 없음)  
> 본 스크립트는 Tampermonkey 외의 스크립트 매니저에서는 정상 동작하지 않을 수 있으며, Chrome 계열 브라우저의 경우 Tampermonkey Beta 버전에 스크립트가 설치되어야 합니다.

## 자주묻는 질문

- Q: 안 돼요.<br />A: Chrome 계열 브라우저의 경우 Tampermonkey Beta 버전에 본 스크립트가 설치되었는지 확인하세요.
- Q: 로그인은 어떻게 해요?<br />A: [chzzk.naver.com](https://chzzk.naver.com) 에서 하세요.
- Q: 왜 Tampermonkey Beta 버전에 스크립트를 설치해야 하나요?<br >A: 기능 동작을 위해 스크립트 매니저에서 지원하는 GM_cookie 이라는 기능을 사용하여야 하는데, Chrome 계열 브라우저의 경우 Tampermonkey Beta 만 해당 기능을 지원합니다. 참고로 다른 브라우저의 경우 Tampermonkey 정식 버전에서도 GM_cookie 를 지원한다는데 테스트 해보지는 않았어요.
- Q: 기존에 사용하던 Tampermonkey 정식 버전과 Beta 버전을 동시에 설치해서 사용해도 괜찮나요?<br />A: 괜찮습니다.
- Q: 스크립트 설치할 때 Tampermonkey 정식 버전과 Beta 버전에서 설치하는 창이 둘 다 떠요.<br />A: 본 스크립트는 Tampermonkey Beta 버전에만 설치되어야 합니다. 만약 특정 버전에서 설치 페이지를 띄우는 것을 원하지 않는다면 다음을 따르세요.<br />[Tampermonkey 정식 or Beta 버전 대시보드] - [설정] - [설정 모드]를 상급자로 변경 - [스크립트 URL 감지] 를 비활성화됨으로 변경 - [저장] 버튼 클릭<br />이렇게 스크립트 URL 감지를 비활성화하여도 [대시보드] - [도구] - [Import from URL] 에 스크립트 주소를 붙여넣기 하고 설치 버튼을 눌러 스크립트를 설치할 수 있습니다.

### 0.0.1 - Jac. 06, 2024

- 최초 커밋

## License

MIT

## Happy??

<a href="https://www.buymeacoffee.com/nomomo" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="60"></a>