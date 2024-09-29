// ==UserScript==
// @name         CHZZK Hide Blind Chat VOD
// @namespace    CHZZK_Hide_Blind_Chat_VOD
// @version      0.0.2
// @description  Hide messages that have been blinded in the VOD chat
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Hide_Blind_Chat_VOD/CHZZK_Hide_Blind_Chat_VOD.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Hide_Blind_Chat_VOD/CHZZK_Hide_Blind_Chat_VOD.user.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';
    const debugFlag = 0; // 1 for debug mode, 0 for normal operation
    GM_addStyle(`[class*="vod_chatting_item__"]:has([class*="live_chatting_message_is_hidden__"]) { ${debugFlag === 1 ? "border: 2px solid red !important;" : "display: none;" } }`);
})();