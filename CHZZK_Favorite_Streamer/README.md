# CHZZK Favorite Streamer

- Chzzk의 팔로우 메뉴에서 즐겨찾는 스트리머를 설정할 수 있습니다.
- 즐겨찾기에 추가된 스트리머는 팔로우 메뉴의 맨 위에 표시됩니다.
- 즐겨찾기 설정 메뉴 또는 드래그 앤 드롭으로 순서를 변경할 수 있습니다.

## Preview

https://github.com/nomomo/Chzzk_Scripts/assets/863079/0c12f628-0df4-48e0-876d-a75417d04c36

## Install

설치 방법을 설명합니다.

### STEP 1. ScriptManager

아래 리스트에서 본인이 사용 중인 브라우저에 맞는 링크에 접속한 후, 유저스크립트 관리 확장기능인 Tampermonkey 를 설치하세요.

- Chrome - [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Firefox - [Tampermonkey](https://addons.mozilla.org/ko/firefox/addon/tampermonkey/)
- Opera - [Tampermonkey](https://addons.opera.com/extensions/details/tampermonkey-beta/)
- Safari - [Tampermonkey](https://safari.tampermonkey.net/tampermonkey.safariextz)
- Edge - [Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### STEP 2. UserScript

- 유저스크립트 관리 확장기능 설치 후 아래의 링크를 클릭하세요. 이후 뜨는 창에서 "설치" 버튼을 눌러 스크립트를 설치합니다.
  - [https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Favorite_Streamer/CHZZK_Favorite_Streamer.user.js](https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Favorite_Streamer/CHZZK_Favorite_Streamer.user.js)

이것으로 설치는 끝입니다. 즐겁게 사용하세요~

> 주의: 본 스크립트를 설치 및 사용하며 브라우저 과부하로 인한 응답 없음/뻗음으로 인한 데이터 손실이나 기타 발생하는 다른 문제에 대하여 개발자는 책임지지 않음(보고된 문제는 없음)  
> 본 스크립트는 Tampermonkey 외의 스크립트 매니저에서는 정상 동작하지 않을 수 있습니다.

## Note

- 코드의 95% 이상을 ChatGPT로 작성했어요. 예외처리 같은 것이 제대로 안 되어 있긴 한데 현재는 대충 잘 되는 것 같아요. 문제가 생기면 스크립트를 비활성화 하세요.
- 팔로우 하지 않은 스트리머에 대해서는 즐겨찾기 기능이 제대로 동작하지 않을 수 있어요.

### 0.0.4 - July 25, 2025

- 치지직 레이아웃 업데이트 후 live 화면에서 "★" 및 설정 버튼이 제대로 표시되지 않는 문제 수정

### 0.0.3 - May 17, 2025

- 치지직 레이아웃 업데이트 후 live 화면에서 "★" 버튼이 제대로 표시되지 않는 문제 수정
- 팔로잉 화면에서 드래그로 리스트 순서 변경 시 드래그를 종료하는 시점에 마우스 포인터가 범위 밖에 존재하는 경우 순서 변경을 취소하도록 수정
- 팔로잉 화면에서 섬네일 또는 라이브 제목을 드래그하여 주소창에 옮겨다 두었을 때 해당 페이지에 대한 새 창이 뜨도록 수정

### 0.0.2 - Aug. 1, 2024

- 치지직 UI 업데이트 후 팔로잉 메뉴의 "★" 버튼과 "★설정" 버튼이 보이지 않는 문제 수정

### 0.0.1 - Jun. 7, 2024

- 최초 커밋

## License

MIT

## Happy??

<a href="https://www.buymeacoffee.com/nomomo" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-yellow.png" alt="Buy Me A Coffee" height="60"></a>
