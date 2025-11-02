// ==UserScript==
// @name         CHZZK Auto Hide Annoying Popups
// @namespace    CHZZK_Auto_Hide_Annoying_Popups
// @version      0.0.2
// @description  Chzzk에서 매일 한 번씩 표시되는 이벤트 알림(첫 충전, 첫 구매, 첫 후원)을 뜨지 않도록 함 + 상단 배너 숨김
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @homepageURL  https://github.com/nomomo/Chzzk_Scripts/CHZZK_Auto_Hide_Annoying_Popups/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Auto_Hide_Annoying_Popups/CHZZK_Auto_Hide_Annoying_Popups.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Auto_Hide_Annoying_Popups/CHZZK_Auto_Hide_Annoying_Popups.user.js
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  // 오늘 날짜 (YYYY-MM-DD)
  const today = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  // 숨길 팝업/이벤트 관련 키 목록
  const HIDE_KEYS = [
    'FIRST_PURCHASE_PROMO_CHEEZE_CHARGE',
    'FIRST_PURCHASE_PROMO_CHEAT_KEY',
    'FIRST_PURCHASE_PROMO_DONATION'
  ];

  HIDE_KEYS.forEach(key => {
    if (localStorage.getItem(key) !== today) {
      localStorage.setItem(key, today);
    }
  });

  GM_addStyle(`
    [class^="band_banner_container__"] {
      display: none !important;
    }
  `);
})();
