// ==UserScript==
// @name         CHZZK Max Quality
// @namespace    CHZZK_Max_Quality
// @version      0.0.1
// @description  Forces video quality to 1080p on chzzk.naver.com
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Max_Quality/CHZZK_Max_Quality.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Max_Quality/CHZZK_Max_Quality.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    try {
        const fixedQuality = {"label":"1080p","width":1920,"height":1080};
        const interval_ms = 1000;
    
        function fixVideoQuality() {
            localStorage.setItem('live-player-video-track', JSON.stringify(fixedQuality));
            //console.log('Video quality fixed to 1080p');
        }
    
        fixVideoQuality();

        // 무식한 것이 때론 가장 편하다.
        setInterval(() => {
            const currentValue = localStorage.getItem('live-player-video-track');
            if (currentValue !== JSON.stringify(fixedQuality)) {
                fixVideoQuality();
            }
        }, interval_ms);
    }
    catch(e){
        console.log("Failed to set max. quality by CHZZK_Max_Quality.user.js");
    }

    // 나중에 트위치처럼 비디오 품질을 지맘대로 낮춘다거나, 더 많은 유저의 귀찮음을 유발하는 케이스가 나오면 그 때 추가 기능 개발을 고려해봅시다.

})();