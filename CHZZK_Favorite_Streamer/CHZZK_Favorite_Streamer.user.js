// ==UserScript==
// @name         CHZZK Favorite Streamer
// @namespace    CHZZK_Favorite_Streamer
// @version      0.0.4
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
// @require      https://code.jquery.com/jquery-3.7.1.min.js#sha256=fc9a93dd241f6b045cbff0481cf4e1901becd0e12fb45166a8f17f95823f0b1a
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
            if (url.includes('https://api.chzzk.naver.com/service/v1/channels/following-lives') || url.includes('https://api.chzzk.naver.com/service/v1/channels/followings/live')) {
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

                            // 원본 responseText를 수정된 데이터로 덮어쓰기
                            Object.defineProperty(this, 'responseText', { value: JSON.stringify(responseData) });
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
    font-family: Sandoll Nemony2, Apple SD Gothic NEO, Helvetica Neue, Helvetica, 나눔고딕, NanumGothic, Malgun Gothic, 맑은 고딕, 굴림, gulim, 새굴림, noto sans, 돋움, Dotum, sans-serif;
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
/*div[class^="button_tab_list"][role="tablist"] {
    width: 100%;
}*/
[class^="component_item__"]:hover .star-container {
    opacity: 1;
    visibility: visible;
}
.pinned .star-container {
    opacity: 1;
    visibility: visible;
}
.pinned .star-icon {
    color: yellow;
}
.pinned .star-icon:hover {
    color: #ffe974;
    opacity: 0.5;
}
.star-icon.gray {
    color: gray !important;
    opacity: 0.5;
}
.star-icon.gray:hover {
    color: #ffe974 !important;
    opacity: 1;
}

.favorite-list-container {
    position: fixed;
    background: rgba(0,0,0,0.9);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    z-index: 1000000000;
    font-size: 16px;
    color: var(--color-content-01);
    cursor: pointer;
}
.modal-title, .modal-footer, .close-message, .favorite-list-container table .name {
    font-family: Sandoll Nemony2, Apple SD Gothic NEO, Helvetica Neue, Helvetica, 나눔고딕, NanumGothic, Malgun Gothic, 맑은 고딕, 굴림, gulim, 새굴림, noto sans, 돋움, Dotum, sans-serif;
}
.favorite-list-container table {
    font-family: -apple-system, BlinkMacSystemFont, Apple SD Gothic Neo, Helvetica, Arial, NanumGothic, 나눔고딕, Malgun Gothic, 맑은 고딕, Dotum, 굴림, gulim, 새굴림, noto sans, 돋움, sans-serif;
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
.favorite-list-item .name {
    min-width:220px;
}
.favorite-list-item .channelId {
    font-size: 12px;
    font-family: 'Consolas';
    letter-spacing: -0.3px;
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
    margin-left: auto;
    margin-right: 10px;
}
.modal-title {
    text-align: center;
    font-size: 20px;
    padding-bottom: 20px;
}
.modal-footer {
    font-size: 15px;
    padding-top: 20px;
    text-align: center;
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
[class^="component_container__"].starOnly [class^="component_item__"] {
    display: none;
}
[class^="component_container__"].starOnly [class^="component_item__"].pinned {
    display: block;
}
#LIVE {
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    padding-right: 9px !important;
}
#FAVORITE_ONLY {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    border-top-right-radius: 15px;
    border-bottom-right-radius: 15px;
    margin-left: -4px !important;
    padding-left: 9px !important;
    padding-right: 9px !important;
    border-left: 1px solid var(--color-bg-01);
}
.favorite-star-button {
    font-size: 18px;
    text-align: center;
    padding: 12px !important;
    transition: color 0.3s ease, border-bottom 0.3s ease;
    position: relative;
    color: gray;
    font-family: Sandoll Nemony2,Apple SD Gothic NEO,Helvetica Neue,Helvetica,나눔고딕,NanumGothic,Malgun Gothic,맑은 고딕,굴림,gulim,새굴림,noto sans,돋움,Dotum,sans-serif;
}
.favorite-star-button.favorite {
    color: yellow;
}
.favorite-star-button:hover {
    color: rgb(192, 192, 64) !important;
}
.favorite-star-button.favorite:hover {
    color: rgb(192, 192, 64) !important;
}
.favorite-star-button.favorite.no-hover:hover {
    color: yellow !important;
}
.favorite-star-button.no-hover:hover {
    color: gray !important;
}





:root {
  --color-content-chzzk-custom: 0, 255, 163; /* RGB 값 */
  --color-content-chzzk-custom-gray: 127, 127, 127; /* RGB 값 */
}

.ghost .star-icon.yellow {
    color: yellow !important;
    opacity: 1.0 !important;
}
.ghost .star-container {
    opacity: 1;
    visibility: visible;
}
/* 드래그 중인 엘리먼트에 적용될 애니메이션 */
@keyframes glowing {
  0% {
    box-shadow: 0 0 3px rgba(var(--color-content-chzzk-custom), 0.3);
    background-color: rgba(var(--color-content-chzzk-custom), 0.05);
  }
  50% {
    box-shadow: 0 0 10px rgba(var(--color-content-chzzk-custom), 0.7);
    background-color: rgba(var(--color-content-chzzk-custom), 0.15);
  }
  100% {
    box-shadow: 0 0 3px rgba(var(--color-content-chzzk-custom), 0.3);
    background-color: rgba(var(--color-content-chzzk-custom), 0.05);
  }
}

/* 회색 빛나는 애니메이션 */
@keyframes glowing-gray {
  0% {
    box-shadow: 0 0 3px rgba(var(--color-content-chzzk-custom-gray), 0.3);
    background-color: rgba(var(--color-content-chzzk-custom-gray), 0.05);
  }
  50% {
    box-shadow: 0 0 10px rgba(var(--color-content-chzzk-custom-gray), 0.7);
    background-color: rgba(var(--color-content-chzzk-custom-gray), 0.15);
  }
  100% {
    box-shadow: 0 0 3px rgba(var(--color-content-chzzk-custom-gray), 0.3);
    background-color: rgba(var(--color-content-chzzk-custom-gray), 0.05);
  }
}

/* 드래그 중인 엘리먼트에 적용할 클래스 */
.ghost [class*="video_card_thumbnail__"] {
  animation: glowing 1.0s infinite;
}
.ghost.ghost-gray [class*="video_card_thumbnail__"] {
  animation: glowing-gray 1.0s infinite;
}





    `);

    //////////////////////////////
    // parse class name
    //////////////////////////////
    const classNameCache = {};

    // 클래스 이름을 찾아주는 함수
    function getClassName(prefix) {
        if (classNameCache.hasOwnProperty(prefix)) {
            return classNameCache[prefix];
        }

        const el = $(`[class*="${prefix}"]`).first();
        if (el.length) {
            const className = getClassWithPrefix(el, prefix);
            classNameCache[prefix] = className;
            return className;
        }

        return `${prefix}not-found`;
    }

    // 특정 클래스 이름으로 시작하는 클래스를 가져오는 함수
    function getClassWithPrefix(element, prefix) {
        if (!element.length) return "";
        return element[0].className.split(' ').find(cls => cls.startsWith(prefix)) || "";
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
        if ($("button#FAVORITE_ONLY").length) return;

        //console.log("addFavoriteTabButton");
        starOnly = false;
        const followingContainer = $('[class^="component_container__"]');
        if (!followingContainer.length) return;

        followingContainer.removeClass('starOnly');

        const tabItemClass = tabList.children().filter((_, child) => $(child).attr('class').startsWith('button_tab_item__')).attr('class');
        const favoriteTabButton = $('<button>', {
            type: 'button',
            id: 'FAVORITE_ONLY',
            class: tabItemClass + ' favorite-tab-button',
            role: 'tab',
            html: '<span style="color:yellow;margin-right:5px;text-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);">★</span>',
            'aria-selected': 'false'
        });

        // 일단 버튼 누를 때 favorite 선택 상태 끄기
        $('[class^="button_tab_list__"] button').on('click', function() {
            favoriteTabButton.attr('aria-selected', 'false');
            if (!liveBtnSimulated) {
                starOnly = false;
            } else {
                liveBtnSimulated = false;
            }
        });

        // DOM
        //console.log("Add favorite button");
        const liveButton = $('[class^="button_tab_list__"] button#LIVE');
        liveButton.after(favoriteTabButton);

        // favorite 버튼 누른 경우
        favoriteTabButton.on('click', function() {
            starOnly = !starOnly;
            const followingContainer = $('[class^="component_container__"]');
            if (!followingContainer.length) return;

            if (starOnly) {
                favoriteTabButton.attr('aria-selected', 'true');
                followingContainer.addClass('starOnly');
            } else {
                favoriteTabButton.attr('aria-selected', 'false');
                followingContainer.removeClass('starOnly');
            }

            if (!document.location.href.includes('https://chzzk.naver.com/following?tab=LIVE')) {
                liveBtnSimulated = true;
                $('#LIVE').click();
            }
        });

        // Live 버튼 누른 경우
        $('#LIVE').on('click', function() {
            if (!starOnly) {
                $('#FAVORITE_ONLY').attr('aria-selected', 'false');
            } else {
                $('#FAVORITE_ONLY').attr('aria-selected', 'true');
            }

            const followingContainer = $('[class^="component_container__"]');
            if (!starOnly && followingContainer.length) {
                followingContainer.removeClass('starOnly');
            }
        });

        // 설정 버튼
        const favoriteTabSettingButton = $('<button>', {
            type: 'button',
            id: 'FAVORITE_SETTINGS',
            class: tabItemClass + ' favorite-tab-setting-button',
            role: 'tab',
            html: '<span style="color:yellow;margin-right:5px;text-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);">★</span>설정'
        });
        tabList.append(favoriteTabSettingButton);

        favoriteTabSettingButton.on('click', showFavoriteListModal);
    }

    // Create tab buttons
    $(document).arrive('[class^="component_container__"]', { existing: true }, function() {
        const tabList = $('[class^="button_tab_list__"]');
        if(!tabList.length) return;
        addFavoriteTabButton(tabList);
    });

    // 즐겨찾기 리스트 모달 표시 함수
    function showFavoriteListModal() {
        // 기존 모달 제거
        $('.favorite-list-container').remove();

        // 모달 컨테이너 생성
        const modalContainer = $('<div>', { class: 'favorite-list-container' });

        // 모달 생성
        const modal = $('<div>', { class: 'favorite-list-modal' });

        const table = $('<table>', { class: 'favorite-list-table' });

        const thead = $('<thead>').html(`
            <tr>
                <th>드래그</th>
                <th>순서</th>
                <th class="name">이름</th>
                <th>ID</th>
                <th>한 칸 이동</th>
                <th>제거</th>
            </tr>
        `);
        table.append(thead);

        const tbody = $('<tbody>');

        favoriteStreamers.forEach((fav, index) => {
            const row = $('<tr>', { class: 'favorite-list-item' }).html(`
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
            `);

            row.find('.delete-btn').on('click', async () => {
                favoriteStreamers.splice(index, 1);
                await GM.setValue('favoriteStreamers', favoriteStreamers);
                showFavoriteListModal();
            });

            row.find('.up-btn').on('click', async () => {
                if (index > 0) {
                    const temp = favoriteStreamers[index - 1];
                    favoriteStreamers[index - 1] = favoriteStreamers[index];
                    favoriteStreamers[index] = temp;
                    await GM.setValue('favoriteStreamers', favoriteStreamers);
                    showFavoriteListModal();
                }
            });

            row.find('.down-btn').on('click', async () => {
                if (index < favoriteStreamers.length - 1) {
                    const temp = favoriteStreamers[index + 1];
                    favoriteStreamers[index + 1] = favoriteStreamers[index];
                    favoriteStreamers[index] = temp;
                    await GM.setValue('favoriteStreamers', favoriteStreamers);
                    showFavoriteListModal();
                }
            });

            tbody.append(row);
        });

        const title = $('<div>', { class: 'modal-title' }).html(`<span style="color:yellow;margin-right:5px;">★</span>즐겨찾는 스트리머<span style="color:yellow;margin-left:5px;">★</span>`);
        modal.append(title);

        table.append(tbody);
        modal.append(table);

        const homepage = GM.info.script.homepage;
        const footer = $('<div>', { class: 'modal-footer' }).html(`<div style="font-size:12px;padding:5px 0 0 0"><a href="${homepage}">${homepage}</a></div>`);
        modal.append(footer);

        const message = $('<div>', { class: 'close-message' }).html(`이 창을 닫으려면 배경을 클릭하세요.`);
        modalContainer.append(modal).append(message);
        $('body').append(modalContainer);

        // 컨테이너 클릭 시 모달 닫기
        modalContainer.on('click', function(event) {
            if (event.target === modalContainer[0]) {
                modalContainer.remove();
                reorderList();
            }
        });

        // 테이블 행을 드래그 앤 드롭으로 정렬할 수 있도록 설정
        new Sortable(tbody[0], {
            handle: '.drag-handle',
            animation: 150,
            onEnd: async function (evt) {
                const movedItem = favoriteStreamers.splice(evt.oldIndex, 1)[0];
                favoriteStreamers.splice(evt.newIndex, 0, movedItem);
                await GM.setValue('favoriteStreamers', favoriteStreamers);
                showFavoriteListModal();
            },
            onChange: function () {
                tbody.find('.order').each((index, cell) => {
                    $(cell).text(index + 1);
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
        if (!item.length) return;

        // 기존의 star-container가 존재하면 제거
        const existingStarContainer = item.find('.star-container');
        if (existingStarContainer.length) {
            existingStarContainer.remove();
        }

        const videoCardContainer = item.find('[class^="video_card_container__"]');
        if (!videoCardContainer.length) return;

        const channelId = channelElem.attr('href').split('/').pop();
        let channelName = getChannelNameFromList(item);

        // 스타 아이콘 컨테이너 추가
        const starContainer = $('<div>', { class: 'star-container' });
        videoCardContainer.css('position', 'relative').append(starContainer);

        // 스타 아이콘 추가
        const starIcon = $('<div>', { class: 'star-icon', html: '★' });
        if (!favoriteStreamers.some(fav => fav.channelId === channelId)) {
            starIcon.addClass('gray');
        }
        starContainer.append(starIcon);

        // 스타 클릭 이벤트 처리
        starIcon.on('click', async () => {
            const favIndex = favoriteStreamers.findIndex(fav => fav.channelId === channelId);
            if (favIndex !== -1) {
                // 이미 고정된 스트리머의 스타를 클릭한 경우
                favoriteStreamers.splice(favIndex, 1);
                starIcon.addClass('gray');
                item.removeClass('pinned');
            } else {
                // 고정되지 않은 스트리머의 스타를 클릭한 경우
                favoriteStreamers.push({ channelId, name: channelName });
                starIcon.removeClass('gray');
                item.addClass('pinned');
            }
            await GM.setValue('favoriteStreamers', favoriteStreamers);
            reorderList();
        });

        // 초기 상태 설정
        if (favoriteStreamers.some(fav => fav.channelId === channelId)) {
            item.addClass('pinned');
        }
    }

    // 리스트 재정렬 함수
    function reorderList(favoriteOnly = false) {
        const container = $('[class^="component_list__"]').first();
        if (!container.length) {
            console.error('Container not found');
            return;
        }

        // 현재 스크롤 위치 저장
        const currentScrollPosition = $(window).scrollTop();

        const items = container.find('li[class^="component_item__"]');
        const favoriteItems = items.filter((_, item) => {
            const channelId = $(item).find('[class^="video_card_channel__"]').attr('href').split('/').pop();
            return favoriteStreamers.some(fav => fav.channelId === channelId);
        });
        const nonFavoriteItems = items.filter((_, item) => {
            const channelId = $(item).find('[class^="video_card_channel__"]').attr('href').split('/').pop();
            return !favoriteStreamers.some(fav => fav.channelId === channelId);
        });

        // 고정된 스트리머 먼저, 나머지는 시청자 수 순으로 정렬
        favoriteItems.sort((a, b) => {
            const aIndex = favoriteStreamers.findIndex(fav => fav.channelId === $(a).find('[class^="video_card_channel__"]').attr('href').split('/').pop());
            const bIndex = favoriteStreamers.findIndex(fav => fav.channelId === $(b).find('[class^="video_card_channel__"]').attr('href').split('/').pop());
            return aIndex - bIndex;
        });

        nonFavoriteItems.sort((a, b) => {
            const aViewers = parseInt($(a).find('[class^="video_card_badge__"]').text().replace(/[^0-9]/g, ''));
            const bViewers = parseInt($(b).find('[class^="video_card_badge__"]').text().replace(/[^0-9]/g, ''));
            return bViewers - aViewers;
        });

        // 정렬된 아이템 재배치
        container.empty();
        const combinedItems = favoriteOnly ? favoriteItems : favoriteItems.add(nonFavoriteItems);
        combinedItems.each((_, item) => {
            container.append(item);
            addStarIcon($(item).find('[class^="video_card_channel__"]'));
        });

        // 스크롤 위치 복원
        $(window).scrollTop(currentScrollPosition);
    }

    // 채널 이름 가져오는 함수
    function getChannelNameFromList(item) {
        const nameElem = item.find('span[class^="name_text__"]').first();
        if (nameElem.length) {
            return nameElem.text().split('\n')[0];
        }
        return "Unknown";
    }

    $(document).arrive('li[class^="component_item__"] [class^="video_card_channel__"]', { existing: true }, function() {
        const elem = $(this);
        addStarIcon(elem);

        const componentList = $('ul[class^="component_list__"]').first();
        if (componentList.length) {

            function updateCurrentItemOnDrag(evt){
                const items = Array.from(componentList.children());
                const newIndex = items.indexOf(evt.item);
                var $prevElement = $(evt.item).prev();
                if (newIndex == 0 || ($prevElement.length && $prevElement.hasClass('pinned'))) {
                    $(evt.item).find('.star-icon').removeClass('gray').addClass('yellow');
                    $(evt.item).removeClass('ghost-gray');
                }
                else{
                    $(evt.item).find('.star-icon').addClass('gray').removeClass('yellow');
                    $(evt.item).addClass('ghost-gray');
                }
            }

            new Sortable(componentList[0], {
                animation: 150,
                //handle: '.star-container',
                ghostClass: 'ghost',     // 드래그 중 엘리먼트 스타일
                //chosenClass: 'chosen',    // 선택된 엘리먼트 스타일
                handle: '[class^="video_card_container__"]',
                onEnd: async function (evt) {
                    // 마우스 커서 좌표 가져오기
                    const e = evt.originalEvent || {};
                    const x = e.clientX, y = e.clientY;
                    // 리스트의 화면 상 위치
                    const rect = componentList[0].getBoundingClientRect();
                    // 밖에 떨궜으면
                    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                        reorderList();
                        return;
                    }

                    const items = Array.from(componentList.children());
                    const draggedItem = $(evt.item);
                    const draggedIndex = evt.newIndex;
                    const draggedChannelId = draggedItem.find('[class^="video_card_channel__"]').attr('href').split('/').pop();

                    const pinnedItems = items.filter(item => $(item).hasClass('pinned') && item !== draggedItem[0]);
                    const startIndex = items.indexOf(pinnedItems[0]);
                    const endIndex = items.indexOf(pinnedItems[pinnedItems.length - 1]);

                    draggedItem.addClass('pinned');
                    draggedItem.find('.star-icon').removeClass('gray');

                    const favIndex = favoriteStreamers.findIndex(fav => fav.channelId === draggedChannelId);
                    if (favIndex !== -1) {
                        favoriteStreamers.splice(favIndex, 1);
                    }

                    if (draggedIndex < startIndex) {
                        const nextItem = $(items[draggedIndex + 1]);
                        if (nextItem && nextItem.hasClass('pinned')) {
                            const nextChannelId = nextItem.find('[class^="video_card_channel__"]').attr('href').split('/').pop();
                            const nextFavIndex = favoriteStreamers.findIndex(fav => fav.channelId === nextChannelId);
                            if (nextFavIndex !== -1) {
                                favoriteStreamers.splice(nextFavIndex, 0, { channelId: draggedChannelId, name: getChannelNameFromList(draggedItem) });
                            }
                        } else {
                            favoriteStreamers.unshift({ channelId: draggedChannelId, name: getChannelNameFromList(draggedItem) });
                        }
                    } else if (pinnedItems.length === 0) {
                        favoriteStreamers.push({ channelId: draggedChannelId, name: getChannelNameFromList(draggedItem) });
                    } else {
                        const prevItem = $(items[draggedIndex - 1]);
                        if (prevItem.length && prevItem.hasClass('pinned')) {
                            const prevChannelId = prevItem.find('[class^="video_card_channel__"]').attr('href').split('/').pop();
                            const prevFavIndex = favoriteStreamers.findIndex(fav => fav.channelId === prevChannelId);
                            favoriteStreamers.splice(prevFavIndex + 1, 0, { channelId: draggedChannelId, name: getChannelNameFromList(draggedItem) });
                        }
                    }

                    await GM.setValue('favoriteStreamers', favoriteStreamers);
                    $(evt.item).removeClass('ghost-gray');
                    $(evt.item).find('.star-icon').removeClass('yellow');
                    reorderList();
                },
                // setData: function (dataTransfer, dragEl) {
                //     dataTransfer.setData('Text', $(dragEl).text());
                // },
                setData: function (dataTransfer, dragEl) {
                    const channelLink = $(dragEl).find('[class^="video_card_thumbnail__"]').attr('href');
                    if (channelLink) {
                        const fullUrl = new URL(channelLink, window.location.origin).href;
                        dataTransfer.setData('text/plain', fullUrl);
                        dataTransfer.setData('text/uri-list', fullUrl);
                    } else {
                        dataTransfer.setData('text/plain', $(dragEl).text());
                    }
                },
               onStart: updateCurrentItemOnDrag,
               onChange: updateCurrentItemOnDrag
            });
        }
    });

    //////////////////////////////
    // Play view
    //////////////////////////////
    // arrive.js를 사용하여 video_information_control__ 클래스 요소 감지
    $(document).arrive('[class^="video_information_control__"]', { existing: true }, function() {
        const videoInfoControl = $(this);

        setTimeout(function() {
            const buttons = videoInfoControl.find('button');
            if (!buttons.length) return;

            const buttonContainer = buttons.filter((_, btn) => $(btn).attr('class').includes('button_container__')).last();
            const buttonMedium = buttons.filter((_, btn) => $(btn).attr('class').includes('button_medium__')).first();
            const buttonCircle = buttons.filter((_, btn) => $(btn).attr('class').includes('button_circle__')).first();
            let buttonColor = buttons.filter((_, btn) => $(btn).attr('class').includes('button_dark__')).first();
            if (!buttonColor.length) {
                buttonColor = buttons.filter((_, btn) => $(btn).attr('class').includes('button_white__')).first();
            }

            const buttonContainerClass = getClassWithPrefix(buttonContainer, 'button_container__');
            const buttonMediumClass = getClassWithPrefix(buttonMedium, 'button_medium__');
            const buttonCircleClass = getClassWithPrefix(buttonCircle, 'button_circle__');
            const buttonColorClass = getClassWithPrefix(buttonColor, 'button_dark__') || getClassWithPrefix(buttonColor, 'button_white__');
            const buttonIconContainerClass = getClassWithPrefix(buttonContainer, 'button_icon_container__');
            const buttonLargerClass = getClassWithPrefix(buttonContainer, 'button_larger__');

            let favClass = "";
            const channelId = getChannelId();
            const favIndex = favoriteStreamers.findIndex(fav => fav.channelId === channelId);
            console.log("buttonIconContainerClass", buttonIconContainerClass);
            if (favIndex !== -1) {
                favClass = "favorite";
            }

            const favoriteButton = $('<button>', {
                type: 'button',
                class: [
                    'favorite-star-button',
                    favClass,
                    buttonContainerClass,
                    buttonMediumClass,
                    buttonCircleClass,
                    buttonColorClass,
                    buttonIconContainerClass,
                    buttonLargerClass
                ]
                // 빈 문자열 제거
                .filter(Boolean)
                .join(' '),
                html: '★'
            });

            updateFavoriteButton(favoriteButton);

            favoriteButton.on('click', async function() {
                const channelId = getChannelId();
                const favIndex = favoriteStreamers.findIndex(fav => fav.channelId === channelId);
                if (!channelId) return;

                if (favIndex !== -1) {
                    favoriteStreamers.splice(favIndex, 1);
                } else {
                    favoriteStreamers.push({ channelId, name: getChannelName() });
                }
                await GM.setValue('favoriteStreamers', favoriteStreamers);
                updateFavoriteButton(favoriteButton);

                favoriteButton.addClass('no-hover');
            });

            favoriteButton.on('mouseout', function() {
                favoriteButton.removeClass('no-hover');
            });

            videoInfoControl.append(favoriteButton);
        }, 200);
    });

    function updateFavoriteButton(button) {
        const channelId = getChannelId();
        if (!channelId) return;

        const isFavorite = favoriteStreamers.some(fav => fav.channelId === channelId);
        if (isFavorite) {
            button.css('color', 'yellow').addClass('favorite');
        } else {
            button.css('color', 'gray').removeClass('favorite');
        }
    }

    function getChannelId() {
        const linkElem = $('[class^="video_information_name__"] [class^="video_information_link__"]').first();
        if (linkElem.length) {
            return linkElem.attr('href').split('/').pop();
        }
        return "Unknown";
    }

    function getChannelName() {
        const nameElem = $('[class^="video_information_name__"] [class^="name_text__"]').first();
        if (nameElem.length) {
            return nameElem.text().split('\n')[0];
        }
        return "Unknown";
    }

})();