// ==UserScript==
// @name         CHZZK Video RealTime
// @namespace    CHZZK_Video_RealTime
// @version      0.0.1
// @description  Displays the actual time of the video when hovering over the slider bar on CHZZK replay videos
// @author       You
// @match        https://chzzk.naver.com/*
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Video_RealTime/CHZZK_Video_RealTime.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Video_RealTime/CHZZK_Video_RealTime.user.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/arrive/2.4.1/arrive.min.js
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(`
    .realtime-display {
        color: white;
        font-weight: 600;
        margin-top: 3px;
        font-size: 12px;
        text-shadow: 0 0 4px rgba(0,0,0,.4);
    }
    `);

    // Helper to parse time string (HH:MM:SS) to seconds
    function timeStringToSeconds(timeString) {
        const parts = timeString.split(':').map(Number);
        return parts.length === 3
            ? parts[0] * 3600 + parts[1] * 60 + parts[2]
            : parts[0] * 60 + parts[1];
    }

    // Helper to format seconds as HH:MM:SS
    function secondsToTimeString(seconds) {
        const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${secs}`;
    }

    let liveOpenDate = "";

    // Main function to add realtime display
    function addRealtimeDisplay() {
        fetch("https://api.chzzk.naver.com/service/v2/videos/" + window.location.pathname.split('/').pop())
            .then((response) => response.json())
            .then((data) => {
                liveOpenDate = new Date(data.content.liveOpenDate);
                console.log("Live Open Date:", liveOpenDate);
            })
            .catch((error) => console.error("Error fetching video metadata:", error));
    }

    // Detect slider element and add event listeners
    document.arrive('div[role="slider"]', { existing: true }, function (slider) {
        slider.addEventListener('mousemove', () => {
            if(liveOpenDate == "") {
                return;
            }
            const timerElement = document.querySelector('.pzp-seeking-preview__time');
            console.log("event");
            if (timerElement) {
                const videoTimeText = timerElement.textContent.trim();
                const videoTimeInSeconds = timeStringToSeconds(videoTimeText);

                // Calculate real-time
                const realTime = new Date(liveOpenDate.getTime() + videoTimeInSeconds * 1000);
                const formattedTime = realTime.toLocaleString();

                // Create or update the realtime div
                let realtimeDiv = timerElement.nextElementSibling;
                if (!realtimeDiv || !realtimeDiv.classList.contains('realtime-display')) {
                    realtimeDiv = document.createElement('div');
                    realtimeDiv.className = 'realtime-display';
                    timerElement.parentElement.appendChild(realtimeDiv);
                }
                realtimeDiv.textContent = `${formattedTime}`;
            }
        });
    });

    // Detect URL changes using History API
    function observeUrlChanges() {
        let lastUrl = "";

        const checkUrl = () => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;

                // Check if the new URL is a video page
                if (/https:\/\/chzzk\.naver\.com\/video\/\d+/.test(currentUrl)) {
                    console.log("URL changed to a video page:", currentUrl);
                    addRealtimeDisplay();
                    return;
                }
            }

            liveOpenDate = "";
            const element = document.querySelector('.realtime-display');
            if (element) {
                element.style.display = 'none';
            }
        };

        // Override pushState and replaceState
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
            originalPushState.apply(this, args);
            checkUrl();
        };

        history.replaceState = function (...args) {
            originalReplaceState.apply(this, args);
            checkUrl();
        };

        // Listen for popstate event
        window.addEventListener('popstate', checkUrl);

        // Initial check on first page load
        checkUrl();
    }

    // Initialize
    observeUrlChanges();
})();
