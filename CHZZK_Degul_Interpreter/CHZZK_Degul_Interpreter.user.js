// ==UserScript==
// @name         CHZZK 데굴어 통역기
// @namespace    CHZZK_Degul_Interpreter
// @version      0.0.2
// @description  치지직에서 '데굴'을 실제 뜻으로 번역해 보여줍니다.
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @homepageURL  https://github.com/nomomo/Chzzk_Scripts/CHZZK_Degul_Interpreter/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Degul_Interpreter/CHZZK_Degul_Interpreter.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Degul_Interpreter/CHZZK_Degul_Interpreter.user.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  // --- 동적으로 변하는 입력창 클래스의 접두사
  const DYNAMIC_CLASS_PREFIXES = ['live_chatting_input_input__'];

  // --- 스킵할 셀렉터(명시)
  const SKIP_SELECTORS = [
    '[contenteditable="true"]',
    '[role="textbox"]',
    'input',
    'textarea',
    'script',
    'style',
  ];
  const SKIP_SELECTOR_STR = SKIP_SELECTORS.join(',');

  /**
   * 텍스트 치환:
   *  A) 단어형
   *   - '데…굴' → '시…발',   '떼…굴' → '씨…발'
   *   - '데…꿀' → '시…빨',   '떼…꿀' → '씨…빨'
   *  B) 자모 축약형
   *   - 'ㄷ…ㄱ' → 'ㅅ…ㅂ',   'ㄸ…ㄱ' → 'ㅆ…ㅂ'
   *   - 'ㄷ…ㄲ' → 'ㅅ…ㅃ',   'ㄸ…ㄲ' → 'ㅆ…ㅃ'
   *
   * 가운데의 특수문자/공백 시퀀스(…)는 그대로 보존.
   */
  function replaceText(s) {
    // 단어형(데/떼 … 꿀/굴)
    let out = s.replace(/(떼|데)([^가-힣A-Za-z0-9]*)(꿀|굴)/gu, (_, head, mid, tail) => {
      const first = head === '떼' ? '씨' : '시';
      const last  = tail === '꿀' ? '빨' : '발';
      return first + mid + last;
    });

    // 자모 축약형(ㄷ/ㄸ … ㄱ/ㄲ)
    out = out.replace(/(ㄸ|ㄷ)([^가-힣A-Za-z0-9]*)(ㄲ|ㄱ)/gu, (_, head, mid, tail) => {
      const first = head === 'ㄸ' ? 'ㅆ' : 'ㅅ';
      const last  = tail === 'ㄲ' ? 'ㅃ' : 'ㅂ';
      return first + mid + last;
    });

    return out;
  }

  /** 요소가 주어진 클래스 접두사 중 하나를 갖는지 확인 */
  function hasAnyClassWithPrefix(el, prefixes) {
    if (!(el instanceof Element) || !el.classList || el.classList.length === 0) return false;
    for (const cls of el.classList) {
      for (const p of prefixes) if (cls.startsWith(p)) return true;
    }
    return false;
  }

  /** 스킵 여부 판단: 명시 셀렉터 + 동적 클래스 접두사 + isContentEditable 백업 */
  function isSkippable(el) {
    if (!(el instanceof Element)) return false;
    if (el.matches(SKIP_SELECTOR_STR)) return true;                  // ✅ 명시 셀렉터 우선
    if (hasAnyClassWithPrefix(el, DYNAMIC_CLASS_PREFIXES)) return true; // ✅ CHZZK 입력창 해시 클래스
    if (el.isContentEditable) return true;                           // ✅ 백업(속성 변형 대비)
    return false;
  }

  /** 노드가 스킵 영역 내부(조상 포함)인지 검사 (Shadow DOM 포함) */
  function isInsideSkippable(node) {
    let n = node;
    while (n) {
      if (n instanceof Element && isSkippable(n)) return true;
      const p = n.parentNode;
      if (p && p.nodeType === 11 /* ShadowRoot */ && p.host) {
        n = p.host; // shadow -> host
      } else {
        n = n.parentNode || null;
      }
    }
    return false;
  }

  /** 텍스트 노드 순회 치환 (입력/편집 영역 제외) */
  function walkAndReplace(root) {
    if (!root) return;
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (t) => {
          if (!t.nodeValue || !t.parentNode) return NodeFilter.FILTER_REJECT;
          return isInsideSkippable(t) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    const edits = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const before = n.nodeValue;
      const after = replaceText(before);
      if (before !== after) edits.push([n, after]);
    }
    for (const [n, after] of edits) n.nodeValue = after;
  }

  /** DOM 변경 관찰: 추가/수정된 텍스트만 처리 */
  function observe(root) {
    if (!root) return;
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'characterData' && m.target && m.target.nodeType === 3) {
          const t = m.target;
          if (isInsideSkippable(t)) continue; // 입력/편집 영역은 무시
          const before = t.nodeValue;
          const after = replaceText(before);
          if (before !== after) t.nodeValue = after;
          continue;
        }
        for (const n of m.addedNodes) {
          if (n.nodeType === 3) {
            if (isInsideSkippable(n)) continue;
            const before = n.nodeValue;
            const after = replaceText(before);
            if (before !== after) n.nodeValue = after;
          } else if (n.nodeType === 1) {
            if (isInsideSkippable(n)) continue;
            walkAndReplace(n);
            if (n.shadowRoot) {
              walkAndReplace(n.shadowRoot);
              observe(n.shadowRoot);
            }
          }
        }
      }
    });
    mo.observe(root, { subtree: true, childList: true, characterData: true });
  }

  /** 부트스트랩 */
  function boot() {
    const docRoot = document.documentElement || document.body;
    walkAndReplace(docRoot);
    observe(docRoot);

    // 열린 Shadow DOM도 초기 스캔/관찰
    document.querySelectorAll('*').forEach((el) => {
      if (el.shadowRoot) {
        walkAndReplace(el.shadowRoot);
        observe(el.shadowRoot);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
