// ==UserScript==
// @name         Better_Multichzzk
// @namespace    Better_Multichzzk
// @version      0.0.1
// @description  Better player for multichzzk
// @author       Nomo
// @match        https://multichzzk.tv/*
// @match        https://chzzk.naver.com/*?embed
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://raw.githubusercontent.com/nomomo/Chzzk_Scripts/main/better_multichzzk/Better_Multichzzk.user.js
// @updateURL    https://raw.githubusercontent.com/nomomo/Chzzk_Scripts/main/better_multichzzk/Better_Multichzzk.user.js
// ==/UserScript==

(function () {
    'use strict';
    let debug = false;

    let url = document.location.href;
    if (url.indexOf("//multichzzk.tv/") !== -1) {
        let iframes = document.querySelectorAll('iframe');
        if (debug) console.log("iframes", iframes);

        iframes.forEach(function (iframe) {
            if (iframe.src.indexOf('?embed') === -1) {
                iframe.src = iframe.src + '?embed';
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

        function handleVideoReady() {
            if (handleVideoReadyFired) return;
            handleVideoReadyFired = true;
            document.querySelector(".pzp-pc__viewmode-button").click();
            document.querySelector('[class^="live_chatting_header_button__"]').click();
        }

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
        });

    }

})();