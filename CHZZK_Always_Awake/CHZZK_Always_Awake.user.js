// ==UserScript==
// @name         CHZZK_Always_Awake
// @namespace    CHZZK_Always_Awake
// @version      0.0.1
// @description  Pretends to be active even when the tab is inactive.
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Always_Awake/CHZZK_Always_Awake.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Always_Awake/CHZZK_Always_Awake.user.js
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(async () => {
    'use strict';
    var DEBUG = false;
    var NOMO_DEBUG = function ( /**/ ) {
        if (!DEBUG) return;
        var args = arguments, args_length = args.length, args_copy = args;
        for (let i = args_length; i > 0; i--) args[i] = args_copy[i - 1];
        args[0] = "[CAA]  ";
        args.length = args_length + 1;
        console.log.apply(console, args);
    };
    var date_n = Number(new Date());

    NOMO_DEBUG("GM_SETTINGS.disable_visibilitychange: true");
    try{
        Object.defineProperty(document, 'hidden', {
            value: false,
            writable: false
        });
    }
    catch(e){
        NOMO_DEBUG("disable_visibilitychange error - hidden redefine", e);
    }

    try{
        Object.defineProperty(document, 'visibilityState', {
            value: 'visible',
            writable: false
        });
    }
    catch(e){
        NOMO_DEBUG("disable_visibilitychange error - visibilityState redefine", e);
    }

    try{
        Object.defineProperty(document, 'webkitVisibilityState', {
            value: 'visible',
            writable: false
        });
    }
    catch(e){
        NOMO_DEBUG("disable_visibilitychange error - webkitVisibilityState redefine", e);
    }

    try{
        document.dispatchEvent(new Event('visibilitychange'));
    }
    catch(e){
        NOMO_DEBUG("disable_visibilitychange error - visibilitychange dispatchEvent", e);
    }

    try{
        document.hasFocus = function () {
            return true;
        };
    }
    catch(e){
        NOMO_DEBUG("disable_visibilitychange error - hasFocus return true", e);
    }

    try{
        unsafeWindow["_addEventListener_" + date_n] = unsafeWindow.addEventListener;
        unsafeWindow.addEventListener = function (a, b, c) {
            if (a === "visibilitychange" || a === "blur" || a === "webkitvisibilitychange") {
                return;
            }

            if (c == undefined){
                c = false;
            }
            unsafeWindow["_addEventListener_" + date_n](a, b, c);
        };
    }
    catch(e){
        NOMO_DEBUG("disable_visibilitychange error - overwrite window addEventListener", e);
    }

    try{
        unsafeWindow.document["_addEventListener_" + date_n] = unsafeWindow.document.addEventListener;
        unsafeWindow.document.addEventListener = function (a, b, c) {
            if (a === "visibilitychange" || a === "blur" || a === "webkitvisibilitychange") {
                return;
            }

            if (c == undefined){
                c = false;
            }
            unsafeWindow.document["_addEventListener_" + date_n](a, b, c);
        };
    }
    catch(e){
        NOMO_DEBUG("disable_visibilitychange error - overwrite document addEventListener", e);
    }

})();
