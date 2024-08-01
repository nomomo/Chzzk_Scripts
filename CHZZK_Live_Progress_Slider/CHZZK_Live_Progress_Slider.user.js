// ==UserScript==
// @name         CHZZK Live Progress Slider
// @namespace    CHZZK_Live_Progress_Slider
// @version      0.0.2
// @description  Show the live progress slider on Chzzk
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Live_Progress_Slider/CHZZK_Live_Progress_Slider.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Live_Progress_Slider/CHZZK_Live_Progress_Slider.user.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    /*
     * arrive.js
     * v2.4.1
     * https://github.com/uzairfarooq/arrive
     * MIT licensed
     *
     * Copyright (c) 2014-2017 Uzair Farooq
     */
    var Arrive=function(e,t,n){"use strict";function r(e,t,n){l.addMethod(t,n,e.unbindEvent),l.addMethod(t,n,e.unbindEventWithSelectorOrCallback),l.addMethod(t,n,e.unbindEventWithSelectorAndCallback)}function i(e){e.arrive=f.bindEvent,r(f,e,"unbindArrive"),e.leave=d.bindEvent,r(d,e,"unbindLeave")}if(e.MutationObserver&&"undefined"!=typeof HTMLElement){var o=0,l=function(){var t=HTMLElement.prototype.matches||HTMLElement.prototype.webkitMatchesSelector||HTMLElement.prototype.mozMatchesSelector||HTMLElement.prototype.msMatchesSelector;return{matchesSelector:function(e,n){return e instanceof HTMLElement&&t.call(e,n)},addMethod:function(e,t,r){var i=e[t];e[t]=function(){return r.length==arguments.length?r.apply(this,arguments):"function"==typeof i?i.apply(this,arguments):n}},callCallbacks:function(e,t){t&&t.options.onceOnly&&1==t.firedElems.length&&(e=[e[0]]);for(var n,r=0;n=e[r];r++)n&&n.callback&&n.callback.call(n.elem,n.elem);t&&t.options.onceOnly&&1==t.firedElems.length&&t.me.unbindEventWithSelectorAndCallback.call(t.target,t.selector,t.callback)},checkChildNodesRecursively:function(e,t,n,r){for(var i,o=0;i=e[o];o++)n(i,t,r)&&r.push({callback:t.callback,elem:i}),i.childNodes.length>0&&l.checkChildNodesRecursively(i.childNodes,t,n,r)},mergeArrays:function(e,t){var n,r={};for(n in e)e.hasOwnProperty(n)&&(r[n]=e[n]);for(n in t)t.hasOwnProperty(n)&&(r[n]=t[n]);return r},toElementsArray:function(t){return n===t||"number"==typeof t.length&&t!==e||(t=[t]),t}}}(),c=function(){var e=function(){this._eventsBucket=[],this._beforeAdding=null,this._beforeRemoving=null};return e.prototype.addEvent=function(e,t,n,r){var i={target:e,selector:t,options:n,callback:r,firedElems:[]};return this._beforeAdding&&this._beforeAdding(i),this._eventsBucket.push(i),i},e.prototype.removeEvent=function(e){for(var t,n=this._eventsBucket.length-1;t=this._eventsBucket[n];n--)if(e(t)){this._beforeRemoving&&this._beforeRemoving(t);var r=this._eventsBucket.splice(n,1);r&&r.length&&(r[0].callback=null)}},e.prototype.beforeAdding=function(e){this._beforeAdding=e},e.prototype.beforeRemoving=function(e){this._beforeRemoving=e},e}(),a=function(t,r){var i=new c,o=this,a={fireOnAttributesModification:!1};return i.beforeAdding(function(n){var i,l=n.target;(l===e.document||l===e)&&(l=document.getElementsByTagName("html")[0]),i=new MutationObserver(function(e){r.call(this,e,n)});var c=t(n.options);i.observe(l,c),n.observer=i,n.me=o}),i.beforeRemoving(function(e){e.observer.disconnect()}),this.bindEvent=function(e,t,n){t=l.mergeArrays(a,t);for(var r=l.toElementsArray(this),o=0;o<r.length;o++)i.addEvent(r[o],e,t,n)},this.unbindEvent=function(){var e=l.toElementsArray(this);i.removeEvent(function(t){for(var r=0;r<e.length;r++)if(this===n||t.target===e[r])return!0;return!1})},this.unbindEventWithSelectorOrCallback=function(e){var t,r=l.toElementsArray(this),o=e;t="function"==typeof e?function(e){for(var t=0;t<r.length;t++)if((this===n||e.target===r[t])&&e.callback===o)return!0;return!1}:function(t){for(var i=0;i<r.length;i++)if((this===n||t.target===r[i])&&t.selector===e)return!0;return!1},i.removeEvent(t)},this.unbindEventWithSelectorAndCallback=function(e,t){var r=l.toElementsArray(this);i.removeEvent(function(i){for(var o=0;o<r.length;o++)if((this===n||i.target===r[o])&&i.selector===e&&i.callback===t)return!0;return!1})},this},s=function(){function e(e){var t={attributes:!1,childList:!0,subtree:!0};return e.fireOnAttributesModification&&(t.attributes=!0),t}function t(e,t){e.forEach(function(e){var n=e.addedNodes,i=e.target,o=[];null!==n&&n.length>0?l.checkChildNodesRecursively(n,t,r,o):"attributes"===e.type&&r(i,t,o)&&o.push({callback:t.callback,elem:i}),l.callCallbacks(o,t)})}function r(e,t){return l.matchesSelector(e,t.selector)&&(e._id===n&&(e._id=o++),-1==t.firedElems.indexOf(e._id))?(t.firedElems.push(e._id),!0):!1}var i={fireOnAttributesModification:!1,onceOnly:!1,existing:!1};f=new a(e,t);var c=f.bindEvent;return f.bindEvent=function(e,t,r){n===r?(r=t,t=i):t=l.mergeArrays(i,t);var o=l.toElementsArray(this);if(t.existing){for(var a=[],s=0;s<o.length;s++)for(var u=o[s].querySelectorAll(e),f=0;f<u.length;f++)a.push({callback:r,elem:u[f]});if(t.onceOnly&&a.length)return r.call(a[0].elem,a[0].elem);setTimeout(l.callCallbacks,1,a)}c.call(this,e,t,r)},f},u=function(){function e(){var e={childList:!0,subtree:!0};return e}function t(e,t){e.forEach(function(e){var n=e.removedNodes,i=[];null!==n&&n.length>0&&l.checkChildNodesRecursively(n,t,r,i),l.callCallbacks(i,t)})}function r(e,t){return l.matchesSelector(e,t.selector)}var i={};d=new a(e,t);var o=d.bindEvent;return d.bindEvent=function(e,t,r){n===r?(r=t,t=i):t=l.mergeArrays(i,t),o.call(this,e,t,r)},d},f=new s,d=new u;t&&i(t.fn),i(HTMLElement.prototype),i(NodeList.prototype),i(HTMLCollection.prototype),i(HTMLDocument.prototype),i(Window.prototype);var h={};return r(f,h,"unbindAllArrive"),r(d,h,"unbindAllLeave"),h}}(window,"undefined"==typeof jQuery?null:jQuery,void 0);

    GM_addStyle(`
        body.live .pzp-pc-live-time--on {
            margin: 0 0 3px 20px;
            cursor: pointer;
        }
        body.live .pzp-pc-vod-time__duration {
            cursor: pointer;
        }
    `);

    function isValidNumber(value) {
        return typeof value === 'number' && isFinite(value);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0'); // Ensure two digits
        return `${mins}:${secs}`;
    }

    function createProgressBar(video) {
        console.log("video.duration", video.duration);
        if (video.duration !== Infinity && video.duration > 30.0) {
            document.querySelector('body').classList.remove("live");
            return;
        }
        if (!video.parentNode.getAttribute('data-custom-progress-bar')) {
            video.parentNode.setAttribute('data-custom-progress-bar', 'true');
        } else {
            console.log("data-custom-progress-bar is true");
            return;
        }

        document.querySelector('body').classList.add("live");


        // As of August 1, 2024, the VOD time display element has been completely removed for Live, so the element needs to be manually added.
        // Check if the element with the class 'pzp-pc__vod-time' exists
        if (!document.querySelector('.pzp-pc__vod-time')) {
            // Find the container with the class 'pzp-pc-live-time--on'
            const liveTimeContainer = document.querySelector('.pzp-pc-live-time--on');
            if (liveTimeContainer) {
                const newElement = document.createElement('div');
                newElement.setAttribute('role', 'timer');
                newElement.setAttribute('aria-live', 'off');
                newElement.classList.add('pzp-pc-vod-time', 'pzp-pc__vod-time');
                newElement.innerHTML = `
                <span role="text" class="pzp-ui-text pzp-pc-vod-time__current-time">0:00</span>
                <div class="pzp-pc-vod-time__bar"></div>
                <span role="text" class="pzp-ui-text pzp-pc-vod-time__duration">0:00</span>`;

                liveTimeContainer.parentNode.insertBefore(newElement, liveTimeContainer);

                // hide "실시간"
                // document.querySelector('.pzp-pc-live-time--on').style.display = 'none';
            } else {
                console.error('Element with class pzp-pc-live-time--on not found.');
            }
        }


        let slider = document.querySelector('.pzp-pc .pzp-pc__progress-slider');
        let progressPlayed = document.querySelector('.pzp-ui-progress__played');
        let handler = document.querySelector('.pzp-ui-slider__handler-wrap');
        let previewTime = document.querySelector('.pzp-pc-seeking-preview__time');
        let currentTimeText = document.querySelector('.pzp-pc-vod-time__current-time');
        let timeDurationText = document.querySelector('.pzp-pc-vod-time__duration');
        let dragging = false;
        let isMouseOverOnSlide = false;

        slider.style.display = "block";
        document.querySelector('.pzp-pc .pzp-pc__vod-time').style.display = 'flex';

        document.addEventListener('click', function(e) {
            if (!e.target.matches('body.live .pzp-pc-live-time--on') && !e.target.matches('body.live .pzp-pc-vod-time__duration')) {
                return;
            }
            let newTime = video.duration === Infinity ? video.buffered.end(video.buffered.length - 1) : video.duration;
            video.currentTime = newTime;
        });

        slider.addEventListener('mousedown', function(e) {
            console.log("mousedown on the slide");
            e.preventDefault();
            dragging = true;
        });

        slider.addEventListener('mouseover', function() {
            //console.log("mouseover on the slide");
            isMouseOverOnSlide = true;
        });

        slider.addEventListener('mouseleave', function() {
            //console.log("mouseleave on the slide");
            isMouseOverOnSlide = false;
        });

        document.addEventListener('mouseup', function(e) {
            if (!dragging) {
                return;
            }
            //console.log("mouseup on the slide while dragging");
            dragging = false;
            const rect = slider.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const newTime = video.duration === Infinity ?
                video.buffered.start(0) + percent * (video.buffered.end(video.buffered.length - 1) - video.buffered.start(0)) :
                percent * video.duration;
            if (isFinite(newTime) && newTime >= 0) {
                video.currentTime = newTime;
            }
        });

        let lastMouseX = 0;
        let lastMouseY = 0;

        document.addEventListener('mousemove', function(event) {
            if (!dragging) {
                return;
            }
            const rect = slider.getBoundingClientRect();
            let newLeft = event.clientX - rect.left;
            let percent = newLeft / rect.width;
            percent = Math.max(0, Math.min(1, percent)); // Clamp between 0 and 1
            const newPosition = percent * 100;

            handler.style.left = `${newPosition}%`;
            progressPlayed.style.transform = `matrix(${percent}, 0, 0, 1, 0, 0)`;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        });

        function updatePreviewTime(e) {
            if (e) {
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            }
            const rect = slider.getBoundingClientRect();
            let newLeft = lastMouseX - rect.left;
            let percent = newLeft / rect.width;
            percent = Math.max(0, Math.min(1, percent)); // Clamp between 0 and 1

            let bufferedStart = video.duration === Infinity ? video.buffered.start(0) : 0;
            let bufferedEnd = video.duration === Infinity ? video.buffered.end(video.buffered.length - 1) : video.duration;
            let currentTime = video.currentTime - bufferedStart;
            let bufferedTime = bufferedEnd - bufferedStart;
            if (!isValidNumber(bufferedTime)) {
                bufferedTime = 0.0;
            }
            if (currentTime > bufferedTime) {
                currentTime = bufferedTime;
            }

            const secondsAgo = bufferedTime - percent * bufferedTime;
            if (secondsAgo <= 0.9) {
                previewTime.innerHTML = `${secondsAgo.toFixed(1)}초 전`;
            } else {
                previewTime.innerHTML = `${Math.floor(secondsAgo)}초 전`;
            }
        }

        slider.addEventListener('mouseover', updatePreviewTime);
        slider.addEventListener('mousemove', updatePreviewTime);

        function updateVideoDisplay() {
            let bufferedStart = video.duration === Infinity ? video.buffered.start(0) : 0;
            let bufferedEnd = video.duration === Infinity ? video.buffered.end(video.buffered.length - 1) : video.duration;
            let currentTime = video.currentTime - bufferedStart;
            let bufferedTime = bufferedEnd - bufferedStart;
            if (!isValidNumber(bufferedTime)) {
                bufferedTime = 0.0;
            }
            if (currentTime > bufferedTime) {
                currentTime = bufferedTime;
            }
            if (!dragging) {
                let progressPercentage = (currentTime / bufferedTime) * 100;

                handler.style.left = `${progressPercentage}%`;
                progressPlayed.style.transform = `matrix(${currentTime / bufferedTime}, 0, 0, 1, 0, 0)`;
            }

            currentTimeText.textContent = ` ${formatTime(currentTime)} `;
            timeDurationText.textContent = ` ${formatTime(bufferedTime)} `;

            if (isMouseOverOnSlide) {
                updatePreviewTime();
            }
        }

        video.addEventListener('timeupdate', updateVideoDisplay);
        video.addEventListener('progress', updateVideoDisplay);

        let slowInternetTimeout = null;
        let threshold = 300; // ms after which user perceives buffering
        video.addEventListener('waiting', () => {
            slowInternetTimeout = setTimeout(() => {
                updateVideoDisplay();
            }, threshold);
        });

        video.addEventListener('playing', () => {
            if (slowInternetTimeout != null) {
                clearTimeout(slowInternetTimeout);
                slowInternetTimeout = null;
            }
        });

        slider.addEventListener('click', (e) => {
            const rect = slider.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if(percent > 100.0){
                percent = 100.0;
            }
            else if(percent < 0.0){
                percent = 0.0;
            }
            let newTime = video.duration === Infinity ?
                video.buffered.start(0) + percent * (video.buffered.end(video.buffered.length - 1) - video.buffered.start(0)) :
                percent * video.duration;
            if (isFinite(newTime) && newTime >= 0) {
                video.currentTime = newTime;
            }
        });
    }

    document.arrive('.pzp-pc__video video', function() {
        const video = this;
        if (video.readyState >= video.HAVE_METADATA) {
            createProgressBar(video);
        } else {
            video.addEventListener('loadedmetadata', function() {
                createProgressBar(video);
            });
        }
    });
})();
