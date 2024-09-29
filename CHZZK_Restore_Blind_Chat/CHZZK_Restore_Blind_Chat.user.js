// ==UserScript==
// @name         CHZZK Restore Blind Chat
// @namespace    CHZZK_Restore_Blind_Chat
// @version      0.0.2
// @description  Restore original chat messages when they are hidden by the admin
// @author       Nomo
// @match        https://chzzk.naver.com/*
// @supportURL   https://github.com/nomomo/Chzzk_Scripts/issues
// @homepage     https://github.com/nomomo/Chzzk_Scripts/
// @downloadURL  https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Restore_Blind_Chat/CHZZK_Restore_Blind_Chat.user.js
// @updateURL    https://github.com/nomomo/Chzzk_Scripts/raw/main/CHZZK_Restore_Blind_Chat/CHZZK_Restore_Blind_Chat.user.js
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // Function to check if class name starts with a specific prefix
    function classStartsWith(element, prefix) {
        return element && Array.from(element.classList).some(className => className.startsWith(prefix));
    }

    // Check and update whether autoscroll is currently active
    let autoscroll = true;
    function updatechatAutoScroll(){
        const scrollButtonChattingElement = document.querySelector('[class*="live_chatting_scroll_button_chatting__"]');
        if (scrollButtonChattingElement) {
            autoscroll = false;
        }
        else {
            autoscroll = true;
        }
    }
    
    // Scroll down the chatbox
    function chatScrollToBottom() {
        const chattingListWrapperElement = document.querySelector('[class*="live_chatting_list_wrapper__"]');
        if (chattingListWrapperElement && autoscroll) {
            chattingListWrapperElement.scrollTop = chattingListWrapperElement.scrollHeight + 1000000;
        }
    }

    // Function to observe individual chat elements for changes in attributes
    function observeChatAttributes(node) {
        if (node.nodeType === 1 && classStartsWith(node, 'live_chatting_message_container__')) {
            // Create a MutationObserver to watch for attribute changes
            const attributeObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const target = mutation.target;
                        if (classStartsWith(target, 'live_chatting_message_is_hidden__')) {
                            const parentElement = target.closest('[class^="live_chatting_list_item__"]');
                            const messageTextElem = target.querySelector('[class^="live_chatting_message_text__"]');
                            if (parentElement && messageTextElem) {
                                const originalMessage = parentElement.getAttribute('data-original-message');
                                if (originalMessage) {
                                    updatechatAutoScroll();
                                    messageTextElem.innerText = `[블라인드된 메시지] ${originalMessage}`;
                                    chatScrollToBottom();
                                }
                            }
                        }
                    }
                });
            });

            attributeObserver.observe(node, { attributes: true });
        }
    }

    // Function to observe individual chat elements
    function observeChatElements(node) {
        if (node.nodeType === 1 && classStartsWith(node, 'live_chatting_list_item__')) {
            const messageTextElem = node.querySelector('[class^="live_chatting_message_text__"]');
            if (messageTextElem) {
                const messageIdElem = node.querySelector('[class^="live_chatting_message_wrapper__"]');
                if (messageTextElem && messageIdElem) {
                    const messageText = messageTextElem.innerText;
                    // Store the original message in a data attribute
                    node.setAttribute('data-original-message', messageText);
                    // Observe the container for attribute changes
                    const messageContainer = node.querySelector('[class^="live_chatting_message_container__"]');
                    if (messageContainer) {
                        observeChatAttributes(messageContainer);
                    }
                }
            }
        }
    }

    // Main observer to detect chat elements in the body
    const mainObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                observeChatElements(node);
            });
        });
    });

    // Start observing the body for chat elements
    function startObserving() {
        const mainContainer = document.body;
        if (mainContainer) {
            mainObserver.observe(mainContainer, { childList: true, subtree: true });

            // Check if chat elements already exist
            const existingChatElements = document.querySelectorAll('[class^="live_chatting_list_item__"]');
            existingChatElements.forEach(node => observeChatElements(node));
        } else {
            setTimeout(startObserving, 1000);
        }
    }

    startObserving();
})();