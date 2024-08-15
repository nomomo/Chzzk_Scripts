// ==UserScript==
// @name         CHZZK Better Shorts Player
// @namespace    CHZZK_Better_Shorts_Player
// @version      0.0.1
// @description  Chzzk 의 클립 보기 화면 개선
// @author       Nomo
// @match        https://m.naver.com/shorts/*
// @homepageURL  https://github.com/nomomo/Chzzk_Scripts/CHZZK_Better_Shorts_Player/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Better_Shorts_Player/CHZZK_Better_Shorts_Player.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Better_Shorts_Player/CHZZK_Better_Shorts_Player.user.js
// @require      https://cdn.jsdelivr.net/npm/arrive@2.4.1/minified/arrive.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
    /* 기본적으로 숨기기 */
#app .sp_progress_wrap,
#app .section_header,
#app .section_info {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}

/* #app에 마우스가 올라가 있을 때만 표시 */
#appt:hover .sp_progress_wrap,
#app:hover .section_header,
#app:hover .section_info {
    opacity: 1;
}

    `);

    const volumeControlClass = 'custom-volume-control-wrapper';
    const handleDefaultSize = 10; // 기본 핸들 크기
    const handleHoverSize = 14;   // 마우스 오버 시 핸들 크기
    let isDragging = false;       // 드래그 상태 플래그

    // 기존 볼륨 컨트롤러 제거 함수
    function removeExistingVolumeControl() {
        document.querySelector(`.${volumeControlClass}`)?.remove();
    }

    // 스타일 설정 함수
    function setStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    // 핸들 크기 설정 함수
    function setHandleSize(handle, size, animate = true) {
        if (animate) {
            handle.style.transition = 'width 0.2s ease, height 0.2s ease, left 0.2s ease';
        } else {
            handle.style.transition = 'none';
        }
        handle.style.width = `${size}px`;
        handle.style.height = `${size}px`;
        handle.style.left = `${-size / 2 + 1}px`; // 중앙 정렬을 위한 위치 조정
    }

    // 볼륨 컨트롤러 추가 함수
    function addVolumeControl() {
        console.log("addVolumeControl");
        // 기존 컨트롤러 제거
        removeExistingVolumeControl();

        // video 엘리먼트 찾기
        const contentWrap = document.querySelector('.sh_wrap');
        if (!contentWrap) return;

        // 이전에 저장된 볼륨 값 불러오기 (없으면 기본값 1.0)
        const savedVolume = GM_getValue('videoVolume', 1.0);

        // 볼륨 컨트롤러 래퍼 엘리먼트 생성
        const volumeWrapper = document.createElement('div');
        volumeWrapper.className = volumeControlClass;
        setStyles(volumeWrapper, {
            position: 'absolute',
            right: '12px',
            top: '40px',
            width: '30px',
            height: '120px',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            pointerEvents: 'auto'
        });

        // 볼륨 컨트롤러 엘리먼트 생성
        const volumeControl = document.createElement('div');
        volumeControl.className = 'custom-volume-control';
        setStyles(volumeControl, {
            width: '2px',  // 컨트롤 바 너비 2px
            height: `calc(100% - ${handleHoverSize * 2}px)`, // 핸들 크기만큼 공간 확보
            backgroundColor: '#333', // 기본 어두운 회색
            borderRadius: '5px',
            position: 'relative',
            cursor: 'pointer',
            marginTop: `${handleHoverSize}px`, // 핸들이 벗어나지 않도록 상단에 마진 추가
        });

        // 볼륨 조절 원 생성
        const volumeHandle = document.createElement('div');
        setHandleSize(volumeHandle, handleDefaultSize, false); // 기본 크기로 설정, 애니메이션 없음
        setStyles(volumeHandle, {
            backgroundColor: '#FFFFFF',
            borderRadius: '50%',
            position: 'absolute',
            bottom: '0',
            cursor: 'pointer',
        });

        // 핸들에 마우스 오버 시 핸들 크기 확대
        volumeHandle.addEventListener('mouseover', () => {
            if (!isDragging) {
                setHandleSize(volumeHandle, handleHoverSize);
            }
        });

        volumeHandle.addEventListener('mouseout', () => {
            if (!isDragging) {
                setHandleSize(volumeHandle, handleDefaultSize);
            }
        });

        // 비디오 엘리먼트 가져오기
        const video = document.querySelector('.webplayer-internal-video');
        if (video) {
            // 이전에 저장된 볼륨 값 적용
            video.volume = savedVolume;
            // 현재 비디오 볼륨에 따라 볼륨 핸들 위치 설정 및 컨트롤 바 색상 업데이트
            volumeHandle.style.bottom = `calc(${video.volume * 100}% - ${handleHoverSize / 2}px)`;
            volumeControl.style.background = `linear-gradient(to top, #fff ${video.volume * 100}%, #333 ${video.volume * 100}%)`;
        }

        // 볼륨 조절 함수
        function setVolume(y) {
            const rect = volumeControl.getBoundingClientRect();
            let volumeLevel = (rect.bottom - y) / rect.height;
            volumeLevel = Math.min(Math.max(volumeLevel, 0), 1); // 0 ~ 1 사이로 제한

            if (video) {
                video.volume = volumeLevel;
                GM_setValue('videoVolume', volumeLevel); // 볼륨 값 저장
            }

            // 볼륨 핸들 위치 조정
            volumeHandle.style.bottom = `calc(${volumeLevel * 100}% - ${handleHoverSize / 2}px)`;
            // 볼륨에 따라 바 색상 업데이트
            volumeControl.style.background = `linear-gradient(to top, #fff ${volumeLevel * 100}%, #333 ${volumeLevel * 100}%)`;
        }

        // 클릭 및 드래그 이벤트 핸들러
        function onMouseMove(e) {
            setVolume(e.clientY);
        }

        volumeControl.addEventListener('mousedown', function(e) {
            isDragging = true;
            setHandleSize(volumeHandle, handleHoverSize); // 드래그 시작 시 핸들 크기 확대
            setVolume(e.clientY); // 처음 클릭 시 볼륨 설정
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', onMouseMove);
                isDragging = false;
                setHandleSize(volumeHandle, handleDefaultSize); // 드래그 종료 시 핸들 크기 원상복귀
            }, { once: true });
        });

        // 볼륨 컨트롤러에 핸들 추가
        volumeControl.appendChild(volumeHandle);
        volumeWrapper.appendChild(volumeControl);
        contentWrap.appendChild(volumeWrapper);
    }

    // .video 엘리먼트가 생성되었을 때 볼륨 컨트롤러 추가
    document.arrive('.webplayer-internal-video', {existing: true}, addVolumeControl);

})();
