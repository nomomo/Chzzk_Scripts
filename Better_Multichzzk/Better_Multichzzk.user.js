// ==UserScript==
// @name         Better_Multichzzk
// @namespace    Better_Multichzzk
// @version      0.0.5
// @description  Better player for multichzzk
// @author       Nomo
// @match        https://multichzzk.tv/*
// @match        https://mul.live/*
// @match        https://chzzk.naver.com/*?multichzzk
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/Better_Multichzzk/Better_Multichzzk.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/Better_Multichzzk/Better_Multichzzk.user.js
// ==/UserScript==

(function () {
    'use strict';
    let debug = false;

    let url = document.location.href;
    if (url.indexOf("//multichzzk.tv/") !== -1 || url.indexOf("//mul.live/") !== -1) {
        let iframes = document.querySelectorAll('iframe');
        if (debug) console.log("iframes", iframes);

        iframes.forEach(function (iframe) {
            if (iframe.src.indexOf('//chzzk.naver.com/') !== -1 && iframe.src.indexOf('?multichzzk') === -1) {
                iframe.src = iframe.src + '?multichzzk';
            }
        });
    } else if (url.indexOf("//chzzk.naver.com/") !== -1) {
        let isTopWindow = window.self === window.top;
        if (isTopWindow) {
            return;
        }

        if (debug) console.log("chzzk embed", url);

        function waitForElement(selector, callback) {
            const existingElement = document.querySelector(selector);

            if (existingElement) {
                callback(existingElement);
            } else {
                const observer = new MutationObserver((mutationsList) => {
                    const targetElement = document.querySelector(selector);
                    if (targetElement) {
                        observer.disconnect();
                        callback(targetElement);
                    }
                });

                observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                });
            }
        }

        let player = undefined;
        let handleVideoReadyFired = false;

        let handleVideoReady = function(){
            if (handleVideoReadyFired) return;
            handleVideoReadyFired = true;
            let viewmode_buttons = document.querySelectorAll(".pzp-pc__viewmode-button");
            if(viewmode_buttons.length == 1){
                viewmode_buttons[0].click();
            }
            else{
                // 치즈나이프와의 충돌 방지
                for (let i = 0; i < viewmode_buttons.length; i++) {
                    let button = viewmode_buttons[i];
                    if (button.getAttribute('aria-label') === '넓은 화면') {
                        button.click();
                        break;
                    }
                }
            }
            document.querySelector('[class^="live_chatting_header_button__"]').click();
        };

        waitForElement("video.webplayer-internal-video", function (node) {
            if (debug) console.log("found video player", node);
            player = node;
            if (player.readyState >= 2) {
                handleVideoReady();
            } else {
                player.addEventListener('loadedmetadata', function once() {
                    player.removeEventListener('loadedmetadata', once);
                    handleVideoReady();
                });
            }
            player.muted = true;
        });

    }

})();