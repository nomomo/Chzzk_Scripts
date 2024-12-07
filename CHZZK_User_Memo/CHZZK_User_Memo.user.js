// ==UserScript==
// @name         CHZZK User Memo
// @namespace    CHZZK_User_Memo
// @version      0.0.2
// @description  치지직에 유저 메모 기능을 추가
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @homepageURL  https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_User_Memo/CHZZK_User_Memo.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_User_Memo/CHZZK_User_Memo.user.js
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// @grant        GM.addStyle
// @grant        GM.registerMenuCommand
// @grant        GM.setClipboard
// @grant        GM.info
// @grant        unsafeWindow
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/arrive/2.4.1/arrive.min.js
// @run-at       document-start
// ==/UserScript==

(function($) {
    'use strict';

    let debug = false
    let maxChatLogs = 30;
    let maxNicknameHistory = 5;

    GM.registerMenuCommand("Set Max Chat Logs", () => {
        const newMax = prompt("Enter the maximum number of chat logs to store:", maxChatLogs);
        if (newMax !== null) {
            maxChatLogs = parseInt(newMax, 10);
            GM.setValue('maxChatLogs', maxChatLogs);
        }
    });

    GM.registerMenuCommand("Set Max Nickname History", () => {
        const newMax = prompt("Enter the maximum number of nickname history to store:", maxNicknameHistory);
        if (newMax !== null) {
            maxNicknameHistory = parseInt(newMax, 10);
            GM.setValue('maxNicknameHistory', maxNicknameHistory);
        }
    });

    GM.registerMenuCommand("Show All Memos", () => {
        showAllMemosModal();
    });

    const escaleEntityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' };
    function escapeHtml(string) { return String(string).replace(/[&<>"'`=/]/g, function (s) { return escaleEntityMap[s]; }); }
    
    // 선택자 문자열 정의
    const selectors = {
        chatListItem: '[class*="live_chatting_list_item__"]',
        usernameContainer: '[class*="live_chatting_username_container__"]',
        nameText: '[class*="name_text__"]',
        chatMessageText: '[class*="live_chatting_message_text__"]',
        profilePopupContainer: '[class*="live_chatting_popup_profile_container__"]',
        profilePopupList: '[class*="live_chatting_popup_profile_list__"]',
        profileUser: '[class*="live_chatting_popup_profile_user__"]',
        profileControlButton: '[class*="live_chatting_popup_profile_control_button__"]',
        headerTitle: '[class*="live_chatting_header_title__"]'
    };

    const OriginalWebSocket = unsafeWindow.WebSocket;
    const nicknameToUidMap = new Map();
    let globalData = {};

    // 초기 설정 값 로드
    async function loadSettings() {
        maxChatLogs = await GM.getValue('maxChatLogs', 50);
        maxNicknameHistory = await GM.getValue('maxNicknameHistory', 5);
        globalData = await GM.getValue('data', {});
    }

    unsafeWindow.WebSocket = function(url, protocols) {
        if (!url.includes("chat.naver.com/chat")) {
            return new OriginalWebSocket(url, protocols);
        }

        if(debug) console.log("Intercepted WebSocket connection to:", url);
        const socket = new OriginalWebSocket(url, protocols);

        socket.addEventListener('message', async function(event) {
            if (event.isIntercepted) {
                return;
            }

            let modifiedData = await storeNicknameUidMapping(event.data);
            if(!modifiedData){
                modifiedData = event.data;
            }
            //if(debug) console.log(event.data);
            //if(debug) console.log("modifiedData", modifiedData)

            event.stopImmediatePropagation();

            const newEvent = new MessageEvent('message', {
                data: modifiedData,
                origin: event.origin,
                lastEventId: event.lastEventId,
                source: event.source,
                ports: event.ports
            });

            newEvent.isIntercepted = true;

            socket.dispatchEvent(newEvent);
        });

        return socket;
    };

    unsafeWindow.WebSocket.prototype = OriginalWebSocket.prototype;

    async function storeNicknameUidMapping(data) {
        const jsonData = JSON.parse(data);

        if (!jsonData.bdy) { 
            return data;
        }

        const messageList = Array.isArray(jsonData.bdy) ? jsonData.bdy : jsonData.bdy.messageList;

        if (!messageList) {
            return data;
        }

        $.each(messageList, (index, message) => {
            const profileData = JSON.parse(message.profile);
            if (!profileData) return;

            const nickname = escapeHtml(profileData.nickname);
            const uid = profileData.userIdHash;

            if (!nickname || !uid) return;

            nicknameToUidMap.set(nickname, uid);

            if(!globalData[uid]) return;
            const userData = globalData[uid];

            let nickChanged = false;
            let oldnick = userData.parsedNickname;
            if (oldnick && userData.parsedNickname !== nickname) {
                if(debug) console.log(`nick changed. ${oldnick} -> ${nickname}`);
                nickChanged = true;

                let stemp = `[닉변 감지:${oldnick} → ${nickname}] `;
                if(message.content) {
                    message.content = stemp + message.content;
                }
                else if(message.msg){
                    message.msg = stemp + message.msg;
                }
                userData.parsedNickname = nickname;
                message.profile = JSON.stringify(profileData);
            }


            if (!globalData[uid].track) {
                if(nickChanged){
                    globalData[uid] = userData;
                    GM.setValue('data', globalData);
                }
                return true;
            }

            const messageTime = Number(message.messageTime || message.msgTime || new Date());
            const msgText = escapeHtml(message.content || message.msg);
            let messageDonate = -1;
            if(message.extras){
                const jsonExtras = JSON.parse(message.extras);
                messageDonate = jsonExtras.payAmount ? Number(jsonExtras.payAmount) : -1;
            }

            //if(debug) console.log(message);

            if (!userData.nicknameHistory) {
                userData.nicknameHistory = [];
                userData.nicknameHistory.push({ nickname, time: messageTime });
            }

            if (nickChanged) {
                if (!userData.nicknameHistory) {
                    userData.nicknameHistory = [];
                }
                const isDuplicateNickname = userData.nicknameHistory.some(
                    (history) => history.nickname === nickname && history.time === messageTime
                );
                if (!isDuplicateNickname) {
                    userData.nicknameHistory.push({ nickname, time: messageTime });
                    if (userData.nicknameHistory.length > maxNicknameHistory) {
                        userData.nicknameHistory.shift();
                    }
                }
            }

            if (msgText) {
                if (!userData.chatLogs) {
                    userData.chatLogs = [];
                }
                const isDuplicateMessage = userData.chatLogs.some(
                    (log) => log.text === msgText && log.time === messageTime
                );
                if (!isDuplicateMessage) {
                    userData.chatLogs.push({ text: msgText, time: messageTime, donate: messageDonate });
                    if (userData.chatLogs.length > maxChatLogs) {
                        userData.chatLogs.shift();
                    }
                }
            }

            userData.parsedNickname = nickname;

            globalData[uid] = userData;
            GM.setValue('data', globalData);
        });

        return JSON.stringify(jsonData);  // 수정된 JSON 데이터를 문자열로 반환
    }

    function handleNewChatItem(element) {
        const $element = $(element);
        const $usernameContainer = $element.find(selectors.usernameContainer);
        if (!$usernameContainer.length) return;

        const $nameTextElement = $usernameContainer.find(selectors.nameText);
        if (!$nameTextElement.length) return;

        const nickname = $nameTextElement.text().trim();
        const uid = nicknameToUidMap.get(nickname);
        if (!uid) return;

        const userData = globalData[uid];
        if (userData) {
            $usernameContainer.append(`<span class="my-nickname">[${userData.nickname || userData.parsedNickname}]</span>`);
        }

        const $button = $('<span>', {
            'class': 'copy-uid-button',
            'html': `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21H9C8.45 21 8 20.55 8 20V6C8 5.45 8.45 5 9 5H14V9C14 10.1 14.9 11 16 11H20V20C20 20.55 19.55 21 19 21ZM15 5.5V9H18.5L15 5.5ZM7 3H15L21 9V20C21 21.1 20.1 22 19 22H9C7.9 22 7 21.1 7 20V4C7 3.45 7.45 3 8 3H7Z" fill="currentColor"/>
                </svg>
            `,
            'click': function(event) {
                event.stopPropagation();
                const $container = $(event.currentTarget).closest(selectors.chatListItem);
                const uid2 = $container.attr('data-uid');
                const currentData = globalData[uid] || { nickname: '', note: '' };
                const chatText = $container.find(selectors.chatMessageText).text().trim();
                const chatTime = Number($button.closest(selectors.chatListItem).attr('data-date'));
                const copyText = `닉네임:${nickname}, UID:${uid2},${currentData.note ? " 메모:" + currentData.note + "," : ""} 채팅내용: ${chatText}, 채팅시간: ${(new Date(chatTime)).toLocaleString()}`;
                copyToClipboard(copyText);
                const $copied = $(`<span class="copied">Copied!!</span>`);
                $(this).after($copied);
                $copied.fadeIn(200);
                setTimeout(function(){
                    $copied.fadeOut(200, function(){
                        $copied.remove();
                    });
                },1000);
            }
        });
        $element.attr('data-uid', uid).attr('data-date', Number(new Date()));

        $element.css('position', 'relative').prepend($button);
    }


    function timeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
    
        const secondsInMinute = 60;
        const secondsInHour = 60 * secondsInMinute;
        const secondsInDay = 24 * secondsInHour;
    
        if (diffInSeconds < secondsInMinute) {
            return `${diffInSeconds}초 전`;
        } else if (diffInSeconds < secondsInHour) {
            const minutes = Math.floor(diffInSeconds / secondsInMinute);
            return `${minutes}분 전`;
        } else if (diffInSeconds < secondsInDay) {
            const hours = Math.floor(diffInSeconds / secondsInHour);
            return `${hours}시간 전`;
        } else {
            const days = Math.floor(diffInSeconds / secondsInDay);
            return `${days}일 전`;
        }
    }


    function createModal(uniqueClass, titleText, contentHtml, additionalButtons = []) {
        $('.modal-container'+'.'+uniqueClass).remove();

        const $modalContainer = $('<div>', { class: 'modal-container ' + uniqueClass }).appendTo('body');
        const $modal = $('<div>', { class: 'modal-content' }).appendTo($modalContainer);

        $('<div>', {
            class: 'modal-header',
            html: `${titleText}`
        }).appendTo($modal);

        $('<div>', {
            class: 'modal-body',
            html: contentHtml
        }).appendTo($modal);

        const $modalFooter = $('<div>', { class: 'modal-footer' }).appendTo($modal);

        $('<button>', {
            text: '닫기',
            click: function() {
                $modalContainer.remove();
            }
        }).appendTo($modalFooter);

        additionalButtons.forEach(button => $modalFooter.append(button));

        // 배경 클릭 시 닫기
        let clickTarget = null;
        $modalContainer.on('mousedown', function(event) {
            if (event.target === $modalContainer[0]) {
                clickTarget = event.target;
            }
            else{
                clickTarget = null
            }
        });
        $modalContainer.on('mouseup', function(event) {
            if (event.target === $modalContainer[0] && clickTarget === $modalContainer[0]) {
                $modalContainer.remove();
            }
            else{
                clickTarget = null
            }
        });
    }

    function openNoteModal(uid, nickname, customNickname, note, track) {
        const contentHtml = `
            <input placeholder="Nickname" value="${customNickname || ''}">
            <textarea placeholder="Note">${note || ''}</textarea>
            <div class="track-checkbox-wrapper">
                <input type="checkbox" ${track ? 'checked' : ''}>
                <label>추적하기 (채팅 로그 및 닉네임 변경 이력을 기록)</label>
            </div>
        `;

        const saveButton = $('<button>', {
            text: 'Save',
            click: async function() {
                const newNickname = $('.modal-body input').val().trim();
                const newNote = $('.modal-body textarea').val().trim();
                const newTrack = $('.modal-body input[type="checkbox"]').is(':checked');

                if (newNickname || newNote || newTrack) {
                    globalData[uid] = {
                        ...globalData[uid],
                        parsedNickname: nickname,
                        nickname: newNickname,
                        note: newNote,
                        track: newTrack
                    };
                    await GM.setValue('data', globalData);
                } else {
                    delete globalData[uid];
                    await GM.setValue('data', globalData);
                }
                $('.modal-container').remove();
            }
        });

        createModal("modal-user-note", `"${nickname}" 에 대한 메모를 작성합니다.`, contentHtml, [saveButton]);
    }

    function copyToClipboard(text) {
        GM.setClipboard(text, 'text');
    }
    
    

    $(document).on('click', '.toggle-track-btn', async function() {
        const uid = $(this).closest('tr').find('td:first').text();
        globalData[uid].track = !globalData[uid].track;
        await GM.setValue('data', globalData);

        let temptxt = globalData[uid].track ? "Yes" : "No";
        $(this).text(temptxt);
    });

    $(document).on('click', '.history-btn', function() {
        const uid = $(this).closest('tr').find('td:first').text();
        showNicknameHistoryModal(uid);
    });

    $(document).on('click', '.chat-log-btn', function() {
        const uid = $(this).closest('tr').find('td:first').text();
        showChatLogsModal(uid);
    });

    $(document).on('click', '.delete-btn', async function() {
        const uid = $(this).closest('tr').find('td:first').text();
        delete globalData[uid];
        await GM.setValue('data', globalData);
        showAllMemosModal();
    });
    function showAllMemosModal() {
        let contentHtml = `
            <table class="all-memos-table">
                <thead>
                    <tr>
                        <th>UID</th>
                        <th>닉네임</th>
                        <th>사용자 닉네임</th>
                        <th>메 모</th>
                        <th>추 적</th>
                        <th>닉변 이력</th>
                        <th>채팅 로그</th>
                        <th>제 거</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const [uid, userData] of Object.entries(globalData)) {
            contentHtml += `
                <tr class="memo-list-item">
                    <td style="font-size:0.8em;">${uid}</td>
                    <td style="white-space:nowrap;">${userData.parsedNickname}</td>
                    <td>${userData.nickname || ''}</td>
                    <td>${userData.note || ''}</td>
                    <td><button class="toggle-track-btn">${userData.track ? 'Yes' : 'No'}</buton></td>
                    <td>${userData.track && userData.nicknameHistory ? '<button class="history-btn">보기(' + userData.nicknameHistory.length + ')</button>' : "-"}</td>
                    <td>${userData.track && userData.chatLogs ? '<button class="chat-log-btn">보기(' + userData.chatLogs.length + ')</button>' : "-"}</td>
                    <td><button class="delete-btn">삭제</button></td>
                </tr>
            `;
        }

        contentHtml += `
                </tbody>
            </table>
        `;

        const clearAllButton = $('<button>', {
            text: '전체 메모 삭제',
            click: async function() {
                if (confirm("정말 모든 메모와 채팅로그를 삭제하시겠습니까?")) {
                    globalData = {};
                    await GM.setValue('data', globalData);
                    showAllMemosModal();
                }
            }
        });

        const clearChatlogButton = $('<button>', {
            text: '채팅 로그만 삭제',
            click: async function() {
                if (confirm("정말 모든 채팅 로그를 삭제하시겠습니까?")) {
                    let logsDeleted = false;

                    for (const uid in globalData) {
                        if (globalData[uid].chatLogs && globalData[uid].chatLogs.length > 0) {
                            globalData[uid].chatLogs = [];
                            logsDeleted = true;
                        }
                    }

                    if (logsDeleted) {
                        await GM.setValue('data', globalData);
                    }
                }
            }
        });
        
        const homepage = GM.info.script.homepage;
        const homepageLink = `<div class="hompageLink"><a href="${homepage}" target="_blank">${homepage}</a></div>`;

        createModal("modal-all-memo", '📝 모든 유저 메모', contentHtml, [clearAllButton, clearChatlogButton, homepageLink]);
    }

    function showNicknameHistoryModal(uid) {
        const userData = globalData[uid];
        if (!userData || !userData.nicknameHistory) return;

        let contentHtml = '<ul>';
        userData.nicknameHistory.forEach(history => {
            contentHtml += `<li>${history.nickname} (변경 시간: ${new Date(history.time).toLocaleString()})</li>`;
        });
        contentHtml += '</ul>';

        createModal("modal-user-nickname-history", '🏷️ 닉네임 히스토리', contentHtml);
    }

    function showChatLogsModal(uid) {
        const userData = globalData[uid];
        if (!userData || !userData.chatLogs) return;
        if(debug) console.log("log", userData.chatLogs);
    
        let contentHtml = `
            <div>
                <div>닉네임: ${userData.parsedNickname}</div>
                <div class="chatlog-uid" data-uid="${uid}">UID: ${uid}</div>
                <div>사용자 닉네임: ${userData.nickname}</div>
                <div>메모: ${userData.note}</div>
            </div>
            <table class="chat-logs-table all-memos-table">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>채팅 내용</th>
                        <th>보낸 시간</th>
                        <th>삭제</th>
                    </tr>
                </thead>
                <tbody>
        `;
    
        let contentContent = '';
        let idxTxt = userData.chatLogs.length;
        userData.chatLogs.forEach((log, index) => {
            let donateTxt = "";
            if(log.donate > 0){
                donateTxt = `(${log.donate} 치즈)`;
            }
            else if(log.donate == 0){
                donateTxt = "(치즈)";
            }
            let logTime = new Date(log.time);
            let logTimeText = `${logTime.toLocaleString()} (${timeAgo(logTime)})`;
            contentContent = `
                <tr data-log-index="${index}">
                    <td>${idxTxt}</td>
                    <td style="text-align:left;">${donateTxt} ${log.text}</td>
                    <td style="white-space:nowrap">${logTimeText}</td>
                    <td><button class="delete-log-btn">삭제</button></td>
                </tr>
            ` + contentContent;

            idxTxt--;
        });
    
        contentHtml += contentContent;
        contentHtml += `
                </tbody>
            </table>
        `;
    
        const clearLogsButton = $('<button>', {
            text: '모든 로그 삭제',
            click: async function() {
                if (confirm("정말 모든 채팅 로그를 삭제하시겠습니까?")) {
                    userData.chatLogs = [];
                    globalData[uid] = userData;
                    await GM.setValue('data', globalData);
                    showChatLogsModal(uid);
                }
            }
        });
    
        createModal("modal-chat-log", '💬 채팅 로그', contentHtml, [clearLogsButton]);
    }
    
    // 동적 생성된 로그 삭제 버튼에 대한 이벤트 핸들러 추가
    $(document).on('click', '.delete-log-btn', async function() {
        const $row = $(this).closest('tr');
        const uid = $(this).closest('.modal-content').find(".chatlog-uid").attr('data-uid');
        const logIndex = $row.data('log-index');
        
        globalData[uid].chatLogs.splice(logIndex, 1);
        await GM.setValue('data', globalData);
        
        $row.remove();
    });
    

    $(document).arrive(selectors.headerTitle, function() {
        const $header = $(this);
        const $viewAllButton = $('<button>', {
            'class': 'view-all-memos-button',
            'text': '모든 메모 보기',
            'click': function() {
                showAllMemosModal();
            }
        });
        $header.append($viewAllButton);
    });

    // 초기 데이터 로드 후 이벤트 설정
    loadSettings().then(() => {
        $(document).arrive(selectors.chatListItem, function() {
            handleNewChatItem(this);
        });
    });

    $(document).arrive(`${selectors.profilePopupContainer} ${selectors.nameText}`, function() {
        const $element = $(this).closest(selectors.profilePopupContainer);
        const $buttonContainer = $element.find(selectors.profilePopupList);
        const $firstButton = $buttonContainer.find("button").first();
        const btnClassName = $firstButton.attr('class');
        const $nickname = $element.find(selectors.nameText);
        const nickname = $nickname.text();
        const uid = $element.closest(selectors.chatListItem).data('uid');
        const currentData = globalData[uid] || { nickname: '', note: '' };

        if (uid) {
            let uidstr = `<div class="uidstr" style="white-space:nowrap; height:1em; margin-bottom:3px; opacity:0.8;">${uid}</div>`;
            let notestr = currentData.note ? `<div class="notestr" style="height:1em; margin-bottom:3px; opacity:0.8;" >Note:${currentData.note}</div>` : '';
            $nickname.after(`<div style="font-weight:400;font-size:0.7em;font-family:-apple-system,BlinkMacSystemFont,Apple SD Gothic Neo,Helvetica,Arial,NanumGothic,나눔고딕,Malgun Gothic,맑은 고딕,Dotum,굴림,gulim,새굴림,noto sans,돋움,sans-serif">${uidstr}${notestr}</div>`);
        }

        const $mymemo = $(`<button type="button" class="${btnClassName} my-memo-btn">📝 메모하기</button>`);
        const $closebtn = $element.find(selectors.profileControlButton);
        $buttonContainer.append($mymemo);

        if(currentData.track){
            if(currentData.chatLogs){
                const $showChatLogs = $(`<button type="button" class="${btnClassName} show-chatLog-btn">💬 채팅 로그 보기 (${currentData.chatLogs.length}개)</button>`);
                $buttonContainer.append($showChatLogs);
                
                $showChatLogs.on("click", function() {
                    $closebtn.trigger("click");
                    showChatLogsModal(uid);
                });
            }

            if(currentData.nicknameHistory){
                const $showNickHistory = $(`<button type="button" class="${btnClassName} show-chatLog-btn">🏷️ 닉변 기록 보기 (${currentData.nicknameHistory.length}개)</button>`);
                $buttonContainer.append($showNickHistory);
                
                $showNickHistory.on("click", function() {
                    $closebtn.trigger("click");
                    showNicknameHistoryModal(uid);
                });
            }
        }

        if (currentData.nickname !== '') {
            $nickname.append(`<span style="color:red; padding-left:5px; font-size:0.7em">[${currentData.nickname}]</span>`);
        }

        $mymemo.on("click", function() {
            $closebtn.trigger("click");
            openNoteModal(uid, nickname, currentData.nickname, currentData.note, currentData.track);
        });
    });

    GM.addStyle(`
        .view-all-memos-button {
            position: absolute;
            top: 10px;
            right: 30px;
            box-sizing: border-box;
            font-size: 10px;
            padding: 5px 10px;
            margin-right: 10px;
            background-color: var(--color-bg-04);
            border: 1px solid rgba(0, 0, 0, 1);
            color: var(--color-content-03);
            border-radius: 17px;
            cursor: pointer;
            font-family: Sandoll Nemony2, Apple SD Gothic NEO, Helvetica Neue, Helvetica, 나눔고딕, NanumGothic, Malgun Gothic, 맑은 고딕, 굴림, gulim, 새굴림, noto sans, 돋움, Dotum, sans-serif;
        }
        .view-all-memos-button:hover {
            color: var(--color-content-01);
            background-color: var(--color-bg-03);
        }
    
        .copy-uid-button {
            opacity: 0.01;
            position: absolute;
            top: 2px;
            right: 0;
            cursor: pointer;
        }
        .copy-uid-button:hover {
            opacity: 0.4;
        }
        .copied {
            color: var(--color-content-01);
            background-color: var(--color-bg-03);
            display:none;
            position:absolute;
            top:-30px;
            right:0px;
            font-size: 12px;
            box-sizing: border-box;
            padding: 7px 14px;
            border-radius: 17px;
        }
    
        .my-nickname {
            font-size: 0.8em;
            vertical-align: bottom;
            color: red;
            padding-left: 3px;
            font-weight: bold;
        }

        .modal-all-memo {
            z-index: 1000000;
        }
        .modal-user-nickname-history, .modal-chat-log {
            z-index: 10000000;
        }

        .modal-container {
            position: fixed;
            background: rgba(0, 0, 0, 0.8);
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 1000000;
            cursor: pointer;
        }
        .modal-content {
            position: relative;
            padding: 20px;
            max-width: 800px;
            width: 90%;
            cursor: default;
            background: var(--color-bg-01);
            border: 1px solid var(--color-bg-02);
            max-height: 80%;
            overflow-y: auto;
        }
        .modal-content table, .modal-content button {
            font-size: 12px;
        }
        .modal-header, .modal-content button, .copied {
            font-family:Sandoll Nemony2,Apple SD Gothic NEO,Helvetica Neue,Helvetica,나눔고딕,NanumGothic,Malgun Gothic,맑은 고딕,굴림,gulim,새굴림,noto sans,돋움,Dotum,sans-serif;
        }
        .modal-header {
            text-align: center;
            font-size: 18px;
            margin-bottom: 20px;
        }
        .modal-body input, .modal-body textarea {
            width: 100%;
            margin-bottom: 10px;
            padding: 10px;
            color: var(--color-content-01);
            background-color: var(--color-bg-01);
            border: 2px solid var(--color-bg-02);
            border-radius: 4px;
        }
        .modal-body input:focus, .modal-body textarea:focus {
            border: 2px solid var(--color-bg-06);
            outline: none;
        }
        .modal-footer {
            margin-top: 15px;
            text-align: center;
        }
        .modal-footer button {
            box-sizing: border-box;
            font-size: 14px;
            padding: 7px 14px;
            margin-right: 10px;
            background-color: var(--color-bg-04);
            border: 1px solid rgba(0,0,0,1);
            color: var(--color-content-03);
            border-radius: 17px;
            cursor: pointer;
        }
        /*.modal-footer button:last-child {
            background-color: #dc3545;
        }*/
        .modal-footer button:hover, .modal-footer button:focus {
            color: var(--color-content-01);
            background-color: var(--color-bg-03);
        }

        .track-checkbox-wrapper {
            margin-bottom: 10px;
        }
        .track-checkbox-wrapper input {
            display: inline-block;
            width: 16px;
            height: 16px;
            vertical-align: text-top;
            margin-left:5px;
        }

        .all-memos-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .all-memos-table th, .all-memos-table td {
            border: 1px solid var(--color-bg-02);
            padding: 3px 5px;
            text-align: center;
        }
        .all-memos-table th {
            white-space: nowrap;
            background: var(--color-bg-04);
        }


        .hompageLink {
            font-size:12px;
            margin-top:15px;
            padding:5px 0 0 0;
        }
        .hompageLink a {
            color: var(--color-content-chzzk-01);
            text-decoration: none;
            position: relative;
            display: inline-block;
            transition: all 0.3s ease;
            padding-bottom: 3px;
            border-bottom: 3px solid rgba(0, 0, 0, 0);
            opacity: 0.8;
        }
        .hompageLink a:hover {
            padding-bottom: 3px;
            color: var(--color-content-chzzk-01);
            border-bottom: 3px solid var(--color-content-chzzk-01);
            opacity: 1;
        }
    `);

})(jQuery);
