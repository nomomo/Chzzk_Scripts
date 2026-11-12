// ==UserScript==
// @name         CHZZK Video RealTime
// @namespace    CHZZK_Video_RealTime
// @version      0.0.2
// @description  Displays the actual time of the video when hovering over the slider bar on CHZZK replay videos
// @author       You
// @match        https://chzzk.naver.com/*
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Video_RealTime/CHZZK_Video_RealTime.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Video_RealTime/CHZZK_Video_RealTime.user.js
// @grant        GM_xmlhttpRequest
// @connect      api.chzzk.naver.com
// ==/UserScript==

(() => {
    'use strict';

    const API = 'https://api.chzzk.naver.com/service/v2/videos/';
    const CLASS = 'chzzk-realtime-display';
    const style = document.createElement('style');
    style.textContent = `.${CLASS} { color: white; font-weight: 600; margin-top: 3px; font-size: 12px; text-shadow: 0 0 4px rgba(0,0,0,.4); white-space: nowrap; }`;
    document.head.appendChild(style);

    let currentVideo = null;
    let startMs = null;
    let generation = 0;
    let frame = 0;

    // The API's timezone-less date is Korean time, regardless of browser timezone.
    function parseLiveDate(value) {
        if (typeof value !== 'string') return NaN;
        const normalized = value.trim().replace(' ', 'T');
        return Date.parse(/[zZ]$|[+-]\d\d:?\d\d$/.test(normalized) ? normalized : `${normalized}+09:00`);
    }

    function parsePosition(text) {
        const parts = text.trim().split(':');
        if (parts.length < 2 || parts.length > 3 || parts.some(p => !/^\d+$/.test(p))) return NaN;
        return parts.reduce((sum, part) => sum * 60 + Number(part), 0);
    }

    function clearDisplays() {
        document.querySelectorAll(`.${CLASS}`).forEach(el => el.remove());
    }

    function requestVideo(videoNo) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: API + encodeURIComponent(videoNo),
                timeout: 15000,
                onload(response) {
                    if (response.status < 200 || response.status >= 300) {
                        reject(new Error(`API HTTP ${response.status}`));
                        return;
                    }
                    try { resolve(JSON.parse(response.responseText)); }
                    catch (error) { reject(error); }
                },
                onerror: () => reject(new Error('API 네트워크 오류')),
                ontimeout: () => reject(new Error('API 요청 시간 초과'))
            });
        });
    }

    async function loadVideo(videoNo, requestGeneration) {
        try {
            const visited = new Set();
            let next = videoNo;
            let liveDate = null;
            let offset = 0;
            while (next && !visited.has(String(next)) && visited.size < 100) {
                visited.add(String(next));
                const data = await requestVideo(next);
                if (requestGeneration !== generation) return;
                const video = data.content;
                if (!video || !video.liveOpenDate) {
                    if (liveDate === null) throw new Error('방송 시작 시각이 없습니다.');
                    break;
                }
                const date = parseLiveDate(video.liveOpenDate);
                if (!Number.isFinite(date)) throw new Error('방송 시작 시각을 해석할 수 없습니다.');
                if (liveDate === null) liveDate = date;
                else if (date === liveDate) offset += Number(video.duration) || 0;
                else break;
                next = video.nextVideo?.videoNo;
            }
            if (requestGeneration !== generation) return;
            startMs = liveDate + offset * 1000;
            scheduleUpdate();
        } catch (error) {
            if (requestGeneration === generation) console.warn('[CHZZK Video RealTime] 영상 정보를 불러오지 못했습니다:', error);
        }
    }

    function update() {
        frame = 0;
        if (startMs === null) return;
        document.querySelectorAll('.pzp-seeking-preview__time').forEach(timer => {
            const seconds = parsePosition(timer.textContent);
            if (!Number.isFinite(seconds) || !timer.parentElement) return;
            let display = timer.parentElement.querySelector(`.${CLASS}`);
            if (!display) {
                display = document.createElement('div');
                display.className = CLASS;
                timer.insertAdjacentElement('afterend', display);
            }
            const value = new Date(startMs + seconds * 1000).toLocaleString('ko-KR', {
                timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });
            if (display.textContent !== value) display.textContent = value;
        });
    }

    function scheduleUpdate() {
        if (!frame) frame = requestAnimationFrame(update);
    }

    function checkVideo() {
        const match = location.pathname.match(/^\/video\/(\d+)(?:\/|$)/);
        const videoNo = match ? match[1] : null;
        if (videoNo === currentVideo) return;
        currentVideo = videoNo;
        startMs = null;
        generation++;
        clearDisplays();
        if (videoNo) loadVideo(videoNo, generation);
    }

    // Watch the player's dynamically replaced preview as well as SPA navigation.
    const observer = new MutationObserver(records => {
        if (records.some(record => {
            const el = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
            return el && !el.closest(`.${CLASS}`) && (el.closest('.pzp-seeking-preview') ||
                [...record.addedNodes].some(node => node.nodeType === Node.ELEMENT_NODE && (node.matches('.pzp-seeking-preview') || node.querySelector('.pzp-seeking-preview'))));
        })) scheduleUpdate();
        checkVideo();
    });
    observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true });
    document.addEventListener('mousemove', scheduleUpdate, { passive: true });
    window.addEventListener('popstate', checkVideo);
    setInterval(checkVideo, 1000);
    checkVideo();
})();
