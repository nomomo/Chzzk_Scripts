// ==UserScript==
// @name         CHZZK_sign_in_iframe
// @namespace    CHZZK_sign_in_iframe
// @version      0.0.2
// @description  iframe 으로 삽입된 CHZZK 페이지에서 로그인이 유지되도록 합니다.
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_sign_in_iframe/CHZZK_sign_in_iframe.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_sign_in_iframe/CHZZK_sign_in_iframe.user.js
// @grant        GM_cookie
// @grant        GM.cookie
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    var DEBUG = false;
    const targetCookies = ["NID_SES", "NID_AUT", "NID_JKL"];

    if (!GM.cookie) {
        console.log("GM.cookie is not supported.");
        return;
    }

    if (DEBUG) {
        GM.cookie.list({}).then(function (cookies, error) {
            console.log("get all coockies", cookies, error);
        });
    }

    function setCookieSameSiteNone(targetCookieName, options) {
        GM.cookie.list({
            name: targetCookieName
        }).then(function (cookies, error) {
            if (!error) {
                for (let i = 0; i < cookies.length; i++) {
                    if(cookies[i].sameSite == "no_restriction" && cookies[i].secure == true){
                        continue;
                    }

                    // if (DEBUG) console.log("Try to delete old cookie", cookies[0]);
                    // GM_cookie.delete(cookies[i], function () {

                    //     cookies[i].sameSite = "no_restriction";
                    //     cookies[i].secure = true;

                    //     if (DEBUG) console.log("Try to set new cookie", cookies[0]);
                    //     GM.cookie.set(cookies[i])
                    //         .then(function () {
                    //             if (DEBUG) console.log('set cookie done');
                    //         }, function (error) {
                    //             if (DEBUG) console.log('set cookie error', error);
                    //         });

                    // })

                    cookies[i].sameSite = "no_restriction";
                    cookies[i].secure = true;

                    if (DEBUG) console.log("Try to set new cookie", cookies[0]);
                    GM.cookie.set(cookies[i])
                        .then(function () {
                        if (DEBUG) console.log('set cookie done');
                    }, function (error) {
                        if (DEBUG) console.log('set cookie error', error);
                    });
                }
            }
            else{
                if (DEBUG) console.log('error from GM.cookie.list of setCookieSameSiteNone');
            }
        });
    }

    for (const ck of targetCookies) {
        setCookieSameSiteNone(ck);
    }

    let isTopWindow = window.self === window.top;

    // 쿠키 변경 시 갱신
    if (cookieStore) {
        cookieStore.addEventListener("change", function (event) {
            if (DEBUG) console.log("cookie change event", event.changed);

            if (event.changed.length > 0 && event.changed[0].sameSite != "none" && targetCookies.includes(event.changed[0].name)) {
                setCookieSameSiteNone(event.changed[0].name);
            }

        });
    } else {
        console.log("cookieStore is not supported.");
        if(isTopWindow){
            setInterval(function () {
                for (const ck of targetCookies) {
                    setCookieSameSiteNone(ck);
                }
            }, 250);
        }
    }

    // 전혀 상관없는 다른 창에서 쿠키 변경된 경우 때문에 문제 발생하는 경우를 방지
    if(!isTopWindow){
        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(function(){
                setInterval(function () {
                    for (const ck of targetCookies) {
                        setCookieSameSiteNone(ck);
                    }
                }, 250);
            },2000);
        });
    }

})();