// ==UserScript==
// @name         CHZZK Favorite Streamer
// @namespace    CHZZK_Favorite_Streamer
// @version      0.0.1
// @description  즐겨찾는 스트리머를 목록 상단에 표시하는 스크립트
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @homepageURL  https://github.com/nomomo/Chzzk_Scripts/CHZZK_Favorite_Streamer/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Favorite_Streamer/CHZZK_Favorite_Streamer.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Favorite_Streamer/CHZZK_Favorite_Streamer.user.js
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.addStyle
// @grant        GM.info
// @require      https://cdnjs.cloudflare.com/ajax/libs/arrive/2.4.1/arrive.min.js#sha256=WXHeZwrvHW+Qpj5u2NCVyiL5XEVf/AzrYL5i4w4aRHM=
// @require      https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js#sha256=ymhDBwPE9ZYOkHNYZ8bpTSm1o943EH2BAOWjAQB+nm4=
// ==/UserScript==

(async function() {
    'use strict';

    let initfavoriteStreamers = [];

    // favoriteStreamers를 불러오기
    let favoriteStreamers = await GM.getValue('favoriteStreamers', initfavoriteStreamers);

    // 전역 변수에 JSON 응답 데이터 저장
    let jsonResponse = null;

    // JSON 응답 데이터를 저장하는 함수
    function saveResponseData(response) {
        jsonResponse = JSON.parse(JSON.stringify(response));
    }

    // 원본 XMLHttpRequest를 저장
    const originalXHR = unsafeWindow.XMLHttpRequest;

    let followingChannelCreated = false;


    // 커스텀 XMLHttpRequest를 생성
    function CustomXHR() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        const originalSend = xhr.send;
        let intercepted = false;
        let requestUrl = "";

        xhr.open = function(method, url, async, user, password) {
            requestUrl = url;
            //if (url.includes('https://api.chzzk.naver.com/service/v1/channels/following-lives') || url.includes('https://api.chzzk.naver.com/service/v1/channels/followings')) {
            if (url.includes('https://api.chzzk.naver.com/service/v1/channels/following-lives') || url.includes('https://api.chzzk.naver.com/service/v1/channels/followings/live')) {
            //if (url.includes('https://api.chzzk.naver.com/service/v1/channels/following-lives') || url.includes('https://api.chzzk.naver.com/service/v1/channels/followings?size=')) {
                intercepted = true;
            }
            originalOpen.apply(xhr, arguments);
        };

        xhr.send = function(body) {
            if (intercepted) {
                xhr.addEventListener('readystatechange', async function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        let responseData = JSON.parse(xhr.responseText);
                        saveResponseData(responseData);

                        if (responseData.code === 200 && responseData.content && responseData.content.followingList) {
                            favoriteStreamers = await GM.getValue('favoriteStreamers', initfavoriteStreamers);

                            // 설정된 채널을 우선순위로 정렬
                            responseData.content.followingList.sort((a, b) => {
                                const aIndex = favoriteStreamers.findIndex(fav => fav.channelId === a.channelId);
                                const bIndex = favoriteStreamers.findIndex(fav => fav.channelId === b.channelId);

                                if (aIndex === -1 && bIndex === -1) {
                                    return 0; // 둘 다 설정된 채널이 아닌 경우 원래 순서 유지
                                } else if (aIndex === -1) {
                                    return 1; // a가 설정된 채널이 아닌 경우 b가 우선
                                } else if (bIndex === -1) {
                                    return -1; // b가 설정된 채널이 아닌 경우 a가 우선
                                } else {
                                    return aIndex - bIndex; // 둘 다 설정된 채널인 경우 설정된 순서대로 정렬
                                }
                            });

                            //if (!requestUrl.includes('https://api.chzzk.naver.com/service/v1/channels/followings/live'))
                            {
                                // 원본 responseText를 수정된 데이터로 덮어쓰기
                                Object.defineProperty(this, 'responseText', { value: JSON.stringify(responseData) });
                            }

                        }
                    }
                });
            }
            originalSend.apply(xhr, arguments);
        };

        return xhr;
    }

    // 원본 XMLHttpRequest를 커스텀 XMLHttpRequest로 오버라이드
    unsafeWindow.XMLHttpRequest = CustomXHR;

    // 기본 스타일 추가
    GM.addStyle(`
.star-container {
    position: absolute;
    top: 0;
    right: 0;
    opacity: 0;
    visibility: hidden;
}
.star-icon {
    line-height: normal;
    text-align: center;
    position: absolute;
    top: 5px;
    right: 5px;
    width: 18px;
    height: 18px;
    cursor: pointer;
    z-index: 10;
    font-size: 18px;
    font-family:Sandoll Nemony2,Apple SD Gothic NEO,Helvetica Neue,Helvetica,나눔고딕,NanumGothic,Malgun Gothic,맑은 고딕,굴림,gulim,새굴림,noto sans,돋움,Dotum,sans-serif;
    text-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);
    transition: color 0.3s ease, opacity 0.3s ease;
}
.star-overlay {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
}
[class^="component_item__"]:hover .star-container {
    opacity: 1;
    visibility: visible;
}
.pinned {
    /*border: 2px solid gold;*/
}
.pinned .star-container {
    opacity: 1;
    visibility: visible;
}
.pinned .star-icon {
    color:yellow;
}
.pinned .star-icon:hover {
    color: #ffe974;
    opacity: 0.5;
}
.star-icon.gray {
    color: gray;
    opacity: 0.5;
}
.star-icon.gray:hover {
    color: #ffe974; /* 살짝 노란색 */
    opacity: 1;
}

.favorite-list-container {
    position: fixed;
    background:rgba(0,0,0,0.9);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flax-start;
    align-items: center;
    z-index: 1000000000;
    font-size: 16px;
    color: var(--color-content-01);
    cursor: pointer;
}
.modal-title, .modal-footer, .close-message, .favorite-list-container table .name{
    font-family:Sandoll Nemony2,Apple SD Gothic NEO,Helvetica Neue,Helvetica,나눔고딕,NanumGothic,Malgun Gothic,맑은 고딕,굴림,gulim,새굴림,noto sans,돋움,Dotum,sans-serif;
}
.favorite-list-container table{
    font-family:-apple-system,BlinkMacSystemFont,Apple SD Gothic Neo,Helvetica,Arial,NanumGothic,나눔고딕,Malgun Gothic,맑은 고딕,Dotum,굴림,gulim,새굴림,noto sans,돋움,sans-serif
}
.favorite-list-modal {
    position: relative;
    background: var(--color-bg-01);
    border: 1px solid var(--color-bg-02);
    padding: 20px;
    max-height: 80%;
    overflow-y: auto;
    cursor: default;
    margin-top: 10vh;
}
.favorite-list-item {
}
.favorite-list-item .channelId {
    font-size:12px;
    font-family:'Consolas';
    letter-spacing:-0.3px;
}
.favorite-list-table {
    width: 100%;
    border-collapse: collapse;
}
.favorite-list-table th, .favorite-list-table td {
    border: 1px solid var(--color-bg-02);
    padding: 5px 10px;
    text-align: center;
}
.favorite-list-table th {
    background: var(--color-bg-04);
}
.favorite-list-table ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    width: 100%;
}
.favorite-list-table li {
    flex: 1;
}
.favorite-list-table button {
    margin: 0 5px;
}
.favorite-tab-setting-button {
    float: right;
    margin-right: 10px;
}
.modal-title {
    text-align: center;
    font-size: 20px;
    padding-bottom: 20px;
}
.modal-footer {
    font-size:15px;
    padding-top:20px;
    text-align:center;
}
.modal-footer a {
    color: var(--color-content-chzzk-01);
    text-decoration: none;
    position: relative;
    display: inline-block;
    transition: all 0.3s ease;
    padding-bottom: 3px;
    border-bottom: 3px solid rgba(0, 0, 0, 0);
    opacity: 0.8;
}

.modal-footer a:hover {
    padding-bottom: 3px;
    color: var(--color-content-chzzk-01);
    border-bottom: 3px solid var(--color-content-chzzk-01);
    opacity: 1;
}

.close-message {
    font-size: 15px;
    color: var(--color-content-04);
    margin: 15px 0;
}




/* 기본적으로 component_item__ 요소 숨기기 */
[class^="following_container__"].starOnly [class^="component_item__"] {
    display: none;
}

/* pinned 클래스가 있는 component_item__ 요소 보이기 */
[class^="following_container__"].starOnly [class^="component_item__"].pinned {
    display: block;
}

#LIVE {
    border-top-left-radius: 15px; /* 왼쪽 상단 */
    border-bottom-left-radius: 15px; /* 왼쪽 하단 */
    border-top-right-radius: 0px; /* 왼쪽 하단 */
    border-bottom-right-radius: 0px; /* 왼쪽 하단 */
    padding-right:9px !important;
}
#FAVORITE_ONLY {
    border-top-left-radius: 0px; /* 왼쪽 상단 */
    border-bottom-left-radius: 0px; /* 왼쪽 하단 */
    border-top-right-radius: 15px; /* 왼쪽 하단 */
    border-bottom-right-radius: 15px; /* 왼쪽 하단 */
    margin-left: 0 !important;
    padding-left:9px !important;
    padding-right:9px !important;
    border-left:1px solid var(--color-bg-01);
}


    `);


    //////////////////////////////
    // parse class name
    //////////////////////////////
    const classNameCache = {};

    // 클래스 이름을 찾아주는 함수
    function getClassName(prefix) {
        // 캐시에서 클래스 이름을 먼저 찾기
        if (classNameCache.hasOwnProperty(prefix)) {
            return classNameCache[prefix];
        }

        // 캐시에 존재하지 않으면 DOM에서 검색
        const el = document.querySelector(`[class*="${prefix}"]`);
        if (el) {
            const className = getClassWithPrefix(el, prefix);
            // 클래스 이름을 캐시에 저장
            classNameCache[prefix] = className;
            return className;
        }

        // 클래스 이름을 찾지 못한 경우
        return `${prefix}not-found`;
    }

    // 특정 클래스 이름으로 시작하는 클래스를 가져오는 함수
    function getClassWithPrefix(element, prefix) {
        if (!element) return "";
        return Array.from(element.classList).find(cls => cls.startsWith(prefix)) || "";
    }

    // 아이콘을 생성하는 함수
    function getNavigatorIcon(type) {
        if (type === 'refresh') {
            return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="${getClassName('navigator_icon_refresh__')}"><path d="M14.8592 8.8996C14.0426 7.76108 12.7079 7.01935 11.2 7.01935C8.71467 7.01935 6.69995 9.03407 6.69995 11.5193C6.69995 14.0046 8.71467 16.0193 11.2 16.0193C13.1671 16.0193 14.8395 14.7571 15.4513 12.9983C15.5459 12.7264 15.6151 12.4426 15.6561 12.1498" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.1529 6.70001V9.15456H12.6984" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
        } else if (type === 'arrow') {
            return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="${getClassName('navigator_icon_arrow__')}"><path d="M7 9L11 13L15 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
        }
        return '';
    }




    //////////////////////////////
    // Tab buttons
    //////////////////////////////
    let starOnly = false;
    let liveBtnSimulated = false;
    // 즐겨찾기 버튼 추가 함수
    function addFavoriteTabButton(tabList) {
        starOnly = false;
        const followingContainer = document.querySelector('[class^="following_container__"]');
        if (!followingContainer) {
            return;
        }
         followingContainer.classList.remove('starOnly');

        const tabItemClass = Array.from(tabList.children).find(child => child.className.startsWith('following_tab_item__')).className;
        const favoriteTabButton = document.createElement('button');
        favoriteTabButton.type = 'button';
        favoriteTabButton.id = 'FAVORITE_ONLY';
        favoriteTabButton.className = tabItemClass + ' favorite-tab-button';
        favoriteTabButton.role = 'tab';
        favoriteTabButton.innerHTML = '<span style="color:yellow;margin-right:5px;text-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);">★</span>';
        favoriteTabButton.setAttribute('aria-selected', 'false');

        // 일단 버튼 누를 때 favorite 선택 상태 끄기
        document.querySelectorAll('[class^="following_tab_list__"] button').forEach(tab => {
            tab.addEventListener('click', () => {
                favoriteTabButton.setAttribute('aria-selected', 'false');
                if(!liveBtnSimulated){
                    starOnly = false;
                }
                else{
                    liveBtnSimulated = false;
                }
            });
        });

        // DOM
        let liveButton = document.querySelector('[class^="following_tab_list__"] button#LIVE');
        liveButton.parentNode.insertBefore(favoriteTabButton, liveButton.nextSibling);

        // favorite 버튼 누른 경우
        favoriteTabButton.addEventListener('click', () => {
            console.log("starOnly", starOnly, "->" ,!starOnly);
            starOnly = !starOnly;
            console.log("starOnly", starOnly);

            const followingContainer = document.querySelector('[class^="following_container__"]');
            if (!followingContainer) {
                return;
            }

            if(starOnly){
                favoriteTabButton.setAttribute('aria-selected', 'true');
                followingContainer.classList.add('starOnly');
            }
            else{
                favoriteTabButton.setAttribute('aria-selected', 'false');
                followingContainer.classList.remove('starOnly');
            }


            if(document.location.href.includes('https://chzzk.naver.com/following?tab=LIVE')){
                //
            }
            else{
                liveBtnSimulated = true;
                document.querySelector('button#LIVE').click();
            }
        });

        // Live 버튼 누른 경우
        document.querySelector('[class^="following_tab_list__"] button#LIVE').addEventListener('click', (elem) => {
            console.log("starOnly", starOnly);
            if(!starOnly){
                document.querySelector('button#FAVORITE_ONLY').setAttribute('aria-selected', 'false');
            }
            else{
                document.querySelector('button#FAVORITE_ONLY').setAttribute('aria-selected', 'true');
            }

            const followingContainer = document.querySelector('[class^="following_container__"]');
            if (!starOnly && followingContainer) {
                console.log("remove starOnly");
                followingContainer.classList.remove('starOnly');
            }
        });

        // 설정 버튼
        const favoriteTabSettingButton = document.createElement('button');
        favoriteTabSettingButton.type = 'button';
        favoriteTabSettingButton.id = 'FAVORITE_SETTINGS';
        favoriteTabSettingButton.className = tabItemClass + ' favorite-tab-setting-button';
        favoriteTabSettingButton.role = 'tab';
        favoriteTabSettingButton.innerHTML = '<span style="color:yellow;margin-right:5px;text-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);">★</span>설정';
        tabList.appendChild(favoriteTabSettingButton);

        favoriteTabSettingButton.addEventListener('click', () => {
            showFavoriteListModal();
        });
    }

    // Create tab buttons
    document.arrive('[class^="following_tab_list__"]', { existing: true }, function(tabList) {
        addFavoriteTabButton(tabList);
    });

    // 즐겨찾기 리스트 모달 표시 함수
    function showFavoriteListModal() {
        // 기존 모달 제거
        const existingModal = document.querySelector('.favorite-list-container');
        if (existingModal) {
            existingModal.remove();
        }

        // 모달 컨테이너 생성
        const modalContainer = document.createElement('div');
        modalContainer.className = 'favorite-list-container';

        // 모달 생성
        const modal = document.createElement('div');
        modal.className = 'favorite-list-modal';

        const table = document.createElement('table');
        table.className = 'favorite-list-table';

        const thead = document.createElement('thead');
        thead.innerHTML = `
        <tr>
            <th>드래그</th>
            <th>순서</th>
            <th>이름</th>
            <th>ID</th>
            <th>한 칸 이동</th>
            <th>제거</th>
        </tr>
    `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        favoriteStreamers.forEach((fav, index) => {
            const row = document.createElement('tr');
            row.className = 'favorite-list-item';
            row.innerHTML = `
            <td class="drag-handle" style="cursor: move;">☰</td>
            <td class="order">${index + 1}</td>
            <td class="name">${fav.name}</td>
            <td class="channelId">${fav.channelId}</td>
            <td>
                <button class="up-btn">▲</button>
                <button class="down-btn">▼</button>
            </td>
            <td>
                <button class="delete-btn">X</button>
            </td>
        `;

            row.querySelector('.delete-btn').addEventListener('click', async () => {
                favoriteStreamers.splice(index, 1);
                await GM.setValue('favoriteStreamers', favoriteStreamers);
                showFavoriteListModal();
            });

            row.querySelector('.up-btn').addEventListener('click', async () => {
                if (index > 0) {
                    const temp = favoriteStreamers[index - 1];
                    favoriteStreamers[index - 1] = favoriteStreamers[index];
                    favoriteStreamers[index] = temp;
                    await GM.setValue('favoriteStreamers', favoriteStreamers);
                    showFavoriteListModal();
                }
            });

            row.querySelector('.down-btn').addEventListener('click', async () => {
                if (index < favoriteStreamers.length - 1) {
                    const temp = favoriteStreamers[index + 1];
                    favoriteStreamers[index + 1] = favoriteStreamers[index];
                    favoriteStreamers[index] = temp;
                    await GM.setValue('favoriteStreamers', favoriteStreamers);
                    showFavoriteListModal();
                }
            });

            tbody.appendChild(row);
        });

        const title = document.createElement('div');
        title.className = 'modal-title';
        title.innerHTML = `<span style="color:yellow;margin-right:5px;">★</span>즐겨찾는 스트리머<span style="color:yellow;margin-left:5px;">★</span>`;
        modal.appendChild(title);

        table.appendChild(tbody);
        modal.appendChild(table);

        const homepage = GM.info.script.homepage;
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.innerHTML = `<div style="font-size:12px;padding:5px 0 0 0"><a href="${homepage}">${homepage}</a></div>`;
        modal.appendChild(footer);

        const message = document.createElement('div');
        message.className = 'close-message';
        message.innerHTML = `이 창을 닫으려면 배경을 클릭하세요.`;

        modalContainer.appendChild(modal);
        modalContainer.appendChild(message);
        document.body.appendChild(modalContainer);

        // 컨테이너 클릭 시 모달 닫기
        modalContainer.addEventListener('click', (event) => {
            if (event.target === modalContainer) {
                modalContainer.remove();
                reorderList();
            }
        });

        // 테이블 행을 드래그 앤 드롭으로 정렬할 수 있도록 설정
        new Sortable(tbody, {
            handle: '.drag-handle', // 드래그 핸들로 사용할 클래스
            animation: 150,
            onEnd: async function (evt) {
                const movedItem = favoriteStreamers.splice(evt.oldIndex, 1)[0];
                favoriteStreamers.splice(evt.newIndex, 0, movedItem);
                await GM.setValue('favoriteStreamers', favoriteStreamers);
                showFavoriteListModal();
            },
            onChange: function () {
                const orderCells = tbody.querySelectorAll('.order');
                orderCells.forEach((cell, index) => {
                    cell.textContent = index + 1;
                });
            }
        });
    }

    
    //////////////////////////////
    // Lists
    //////////////////////////////
    // 스트리머 아이템에 스타 아이콘 추가
    function addStarIcon(channelElem) {
        const item = channelElem.closest('li[class^="component_item__"]');
        if (!item) return;

        // 기존의 star-container가 존재하면 제거
        const existingStarContainer = item.querySelector('.star-container');
        if (existingStarContainer) {
            existingStarContainer.remove();
        }

        let videoCardContainer = item.querySelector('[class^="video_card_container__"]');
        if (!videoCardContainer) return;

        const channelId = channelElem.href.split('/').pop();
        let channelName = item.querySelector('[class^="video_card_channel__"]').innerText;

        // \n 이후의 텍스트 제거
        channelName = channelName.split('\n')[0];

        // 스타 아이콘 컨테이너 추가
        const starContainer = document.createElement('div');
        starContainer.className = 'star-container';
        videoCardContainer.style.position = 'relative';
        videoCardContainer.appendChild(starContainer);

        // 스타 아이콘 추가
        const starIcon = document.createElement('div');
        starIcon.className = 'star-icon';
        starIcon.innerHTML = '★';
        if (!favoriteStreamers.some(fav => fav.channelId === channelId)) {
            starIcon.classList.add('gray');
        }
        starContainer.appendChild(starIcon);

        // 스타 클릭 이벤트 처리
        starIcon.addEventListener('click', async () => {
            const favIndex = favoriteStreamers.findIndex(fav => fav.channelId === channelId);
            if (favIndex !== -1) {
                // 이미 고정된 스트리머의 스타를 클릭한 경우
                favoriteStreamers.splice(favIndex, 1);
                starIcon.innerHTML = '★';
                starIcon.classList.add('gray');
                item.classList.remove('pinned');
            } else {
                // 고정되지 않은 스트리머의 스타를 클릭한 경우
                favoriteStreamers.push({ channelId, name: channelName });
                starIcon.innerHTML = '★';
                starIcon.classList.remove('gray');
                item.classList.add('pinned');
            }
            await GM.setValue('favoriteStreamers', favoriteStreamers);
            reorderList();
        });

        // 초기 상태 설정
        if (favoriteStreamers.some(fav => fav.channelId === channelId)) {
            item.classList.add('pinned');
        }
    }

    // 리스트 재정렬 함수
    function reorderList(favoriteOnly = false) {
        const container = document.querySelector('[class^="component_list__"]');
        if (!container) {
            console.error('Container not found');
            return;
        }

        const items = Array.from(container.querySelectorAll('li[class^="component_item__"]'));
        const favoriteItems = items.filter(item => {
            const channelId = item.querySelector('[class^="video_card_channel__"]').href.split('/').pop();
            return favoriteStreamers.some(fav => fav.channelId === channelId);
        });
        const nonFavoriteItems = items.filter(item => {
            const channelId = item.querySelector('[class^="video_card_channel__"]').href.split('/').pop();
            return !favoriteStreamers.some(fav => fav.channelId === channelId);
        });

        // 고정된 스트리머 먼저, 나머지는 시청자 수 순으로 정렬
        favoriteItems.sort((a, b) => {
            const aIndex = favoriteStreamers.findIndex(fav => fav.channelId === a.querySelector('[class^="video_card_channel__"]').href.split('/').pop());
            const bIndex = favoriteStreamers.findIndex(fav => fav.channelId === b.querySelector('[class^="video_card_channel__"]').href.split('/').pop());
            return aIndex - bIndex;
        });

        nonFavoriteItems.sort((a, b) => {
            const aViewers = parseInt(a.querySelector('[class^="video_card_badge__"]').innerText.replace(/[^0-9]/g, ''));
            const bViewers = parseInt(b.querySelector('[class^="video_card_badge__"]').innerText.replace(/[^0-9]/g, ''));
            return bViewers - aViewers;
        });

        // 정렬된 아이템 재배치
        container.innerHTML = '';
        console.log("favoriteOnly", favoriteOnly);
        const combinedItems = favoriteOnly ? favoriteItems : favoriteItems.concat(nonFavoriteItems);
        combinedItems.forEach(item => {
            container.appendChild(item);
            addStarIcon(item.querySelector('[class^="video_card_channel__"]'));
        });
    }
    
    document.arrive('li[class^="component_item__"] [class^="video_card_channel__"]', { existing: true }, function(elem){
        //console.log(elem);
        addStarIcon(elem);
    });

    // 매번 할 이유 없음. performance issue 로 비활성
    // 간혹 즐찾 제거 후 페이지 왔다갔다 하면 꼬이는 문제 있긴 하지만 대충 무시하자.
    //document.arrive('ul[class^="component_list__"]', { existing: true }, function(elem){
    //    //console.log(elem);
    //    reorderList();
    //});



    
    //////////////////////////////
    // Play view
    //////////////////////////////
    // CSS 추가
    GM.addStyle(`
.favorite-star-button {
    font-size: 18px;
    text-align: center;
    padding: 12px !important;
    transition: color 0.3s ease, border-bottom 0.3s ease;
    position: relative;
    color: gray;
}
.favorite-star-button.favorite {
    color: yellow;
}
.favorite-star-button:hover {
    color: rgb(192, 192, 64) !important; /* 마우스 올렸을 때 노란색 */
}

.favorite-star-button.favorite:hover {
    color: rgb(192, 192, 64) !important; /* 이미 즐겨찾기된 경우 마우스 올렸을 때 회색 */
}

.favorite-star-button.favorite.no-hover:hover {
    color: yellow !important; /* no-hover 클래스가 있을 때 hover 색상 무시 */
}
.favorite-star-button.no-hover:hover {
    color: gray !important; /* no-hover 클래스가 있을 때 hover 색상 무시 */
}
`);

    // arrive.js를 사용하여 video_information_control__ 클래스 요소 감지
    document.arrive('[class^="video_information_control__"]', { existing: true }, function(videoInfoControl) {

        setTimeout(function(){
            // 버튼 클래스 이름 찾기
            const buttons = Array.from(videoInfoControl.querySelectorAll('button'));
            if (!buttons.length) return;

            const buttonContainer = buttons.find(btn => btn.className.includes('button_container__'));
            const buttonMedium = buttons.find(btn => btn.className.includes('button_medium__'));
            const buttonCircle = buttons.find(btn => btn.className.includes('button_circle__'));
            let buttonColor = buttons.find(btn => btn.className.includes('button_dark__'));
            if (!buttonColor) {
                buttonColor = buttons.find(btn => btn.className.includes('button_white__'));
            }

            const buttonContainerClass = getClassWithPrefix(buttonContainer, 'button_container__');
            const buttonMediumClass = getClassWithPrefix(buttonMedium, 'button_medium__');
            const buttonCircleClass = getClassWithPrefix(buttonCircle, 'button_circle__');
            const buttonColorClass = getClassWithPrefix(buttonColor, 'button_dark__') || getClassWithPrefix(buttonColor, 'button_white__');

            let favClass = "";
            const channelId = getChannelId();
            const favIndex = favoriteStreamers.findIndex(fav => fav.channelId === channelId);
            if (favIndex !== -1) {
                favClass = "favorite";
            }

            // 즐겨찾기 버튼 추가
            const favoriteButton = document.createElement('button');
            favoriteButton.type = 'button';
            favoriteButton.className = `favorite-star-button ${favClass} ${buttonContainerClass} ${buttonMediumClass} ${buttonCircleClass} ${buttonColorClass}`;
            favoriteButton.innerHTML = `★`;

            // 초기 상태 설정
            updateFavoriteButton(favoriteButton);

            favoriteButton.addEventListener('click', async () => {
                const channelId = getChannelId();
                const favIndex = favoriteStreamers.findIndex(fav => fav.channelId === channelId);
                if (!channelId) return;

                if (favIndex !== -1) {
                    // 이미 고정된 스트리머의 스타를 클릭한 경우
                    favoriteStreamers.splice(favIndex, 1);
                } else {
                    // 고정되지 않은 스트리머의 스타를 클릭한 경우
                    favoriteStreamers.push({ channelId, name: getChannelName() });
                }
                await GM.setValue('favoriteStreamers', favoriteStreamers);
                updateFavoriteButton(favoriteButton);

                // 클릭 후 일시적으로 hover 이벤트 비활성화
                favoriteButton.classList.add('no-hover');
            });

            // mouseout 이벤트 핸들러에서 no-hover 클래스 제거
            favoriteButton.addEventListener('mouseout', () => {
                favoriteButton.classList.remove('no-hover');
            });

            videoInfoControl.appendChild(favoriteButton);
        },200);
    });

    // 즐겨찾기 버튼 업데이트 함수
    function updateFavoriteButton(button) {
        const channelId = getChannelId();
        if (!channelId) return;

        const isFavorite = favoriteStreamers.some(fav => fav.channelId === channelId);
        if (isFavorite) {
            button.style.color = 'yellow';
            button.classList.add('favorite');
        } else {
            button.style.color = 'gray';
            button.classList.remove('favorite');
        }
    }

    // 채널 ID 가져오는 함수
    function getChannelId() {
        const linkElem = document.querySelector('p[class^="video_information_name__"] a[class^="video_information_link__"]');
        if (linkElem) {
            return linkElem.href.split('/').pop();
        }
        return "Unknown";
    }

    // 채널 이름 가져오는 함수
    function getChannelName() {
        const nameElem = document.querySelector('p[class^="video_information_name__"] span[class^="name_text__"]');
        if (nameElem) {
            return nameElem.textContent.split('\n')[0];
        }
        return "Unknown";
    }


})();
