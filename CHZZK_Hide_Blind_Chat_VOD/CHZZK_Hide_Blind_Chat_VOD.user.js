// ==UserScript==
// @name         CHZZK Hide Blind Chat VOD
// @namespace    CHZZK_Hide_Blind_Chat_VOD
// @version      0.0.1
// @description  Hide messages that have been blinded in the VOD chat
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Hide_Blind_Chat_VOD/CHZZK_Hide_Blind_Chat_VOD.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Hide_Blind_Chat_VOD/CHZZK_Hide_Blind_Chat_VOD.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Set debug flag (1 for debug mode, 0 for normal operation)
    const debugFlag = 0;

    // Use arrive.js to monitor for new elements that contain 'live_chatting_message_is_hidden__' in their class
    document.arrive('[class*="live_chatting_message_is_hidden__"]', function(newElement) {
        // Find the parent element with class containing 'vod_chatting_item__'
        let parent = newElement.closest('[class*="vod_chatting_item__"]');
        if (parent) {
            if (debugFlag === 1) {
                // If debug flag is 1, apply a red border with !important
                parent.style.setProperty('border', '2px solid red', 'important');
            } else {
                // Otherwise, hide the parent element
                parent.style.display = 'none';
            }
        }
    });
})();
