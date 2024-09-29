# CHZZK Restore Blind Chat

- 이 스크립트는 Chzzk에서 관리자가 블라인드한 채팅 메시지를 표시합니다.
- 메시지가 숨겨지면 "[블라인드된 메시지]"라는 접두어와 함께 원래 메시지를 표시합니다.

## 설치

아래 단계를 따라 UserScript를 설치하세요.

### STEP 1. ScriptManager

먼저 아래 링크에서 본인이 사용 중인 브라우저에 맞는 Tampermonkey 확장 프로그램을 설치하세요.

- Chrome - [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Firefox - [Tampermonkey](https://addons.mozilla.org/ko/firefox/addon/tampermonkey/)
- Opera - [Tampermonkey](https://addons.opera.com/extensions/details/tampermonkey-beta/)
- Safari - [Tampermonkey](https://safari.tampermonkey.net/tampermonkey.safariextz)
- Edge - [Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### STEP 2. UserScript

Tampermonkey 확장 프로그램 설치 후, 아래 링크를 클릭하세요. 팝업 창에서 "설치" 버튼을 눌러 스크립트를 설치합니다.

- [https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Restore_Blind_Chat/CHZZK_Restore_Blind_Chat.user.js](https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Restore_Blind_Chat/CHZZK_Restore_Blind_Chat.user.js)

설치는 여기까지입니다. 즐겁게 사용하세요~

> 주의: 본 스크립트를 설치 및 사용하며 발생하는 브라우저 과부하로 인한 응답 없음, 뻗음으로 인한 데이터 손실이나 기타 문제에 대해 개발자는 책임지지 않습니다(보고된 문제는 없음).  
> 본 스크립트는 Tampermonkey 외의 스크립트 매니저에서는 정상 동작하지 않을 수 있습니다.

## 참고사항

- 코드의 95% 이상을 ChatGPT로 작성했습니다. 예외 처리가 제대로 되어 있지는 않지만 현재는 대체로 잘 동작합니다. 문제가 생기면 스크립트를 비활성화하세요.

### 0.0.2 - Sep 29, 2024

- 메시지가 블라인드 될 때 간헐적으로 자동 스크롤이 멈추는 문제 수정

### 0.0.1 - Jul 14, 2024

- 최초 커밋

## 라이선스

MIT

## 후원하기

<a href="https://www.buymeacoffee.com/nomomo" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="60"></a>