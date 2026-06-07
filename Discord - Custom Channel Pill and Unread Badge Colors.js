// ==UserScript==
// @name         Discord - Custom Channel Pill and Unread Badge Colors
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Fixes Discord channel pills and unread badges that are broken by Dark Reader
// @author       PixelSpark987 - https://is.gd/PS987
// @match        https://discord.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ================= CONFIGURATION =================
    // hex codes
    const PASSIVE_TAB_COLOR  = '#ffffff'; // Color for unread/passive channel side-dots
    const ACTIVE_TAB_COLOR   = '#ff00ff'; // Color for the active channel side-pill you are viewing
    const UNREAD_BADGE_COLOR = '#ffffff'; // Color for the unread mention badges/dots in chats
    // =================================================

    // Helper function to convert hex to RGB
    function hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
    }

    const targetPassiveRgb = hexToRgb(PASSIVE_TAB_COLOR);
    const targetActiveRgb  = hexToRgb(ACTIVE_TAB_COLOR);
    const targetUnreadRgb  = hexToRgb(UNREAD_BADGE_COLOR);

    // Function to apply styles to the channel pills (.item__58105)
    function applyPillStyles(element) {
        const currentHeight = element.style.height;
        let chosenColor = PASSIVE_TAB_COLOR;

        if (currentHeight === '40px') {
            chosenColor = ACTIVE_TAB_COLOR;
        }

        element.style.setProperty('background-color', chosenColor, 'important');
        element.style.setProperty('display', 'inline-block', 'important');

        if (currentHeight !== '40px') {
            element.style.setProperty('width', '8px', 'important');
        } else {
            element.style.removeProperty('width');
        }
    }

    // Function to apply styles to unread badges (.unread__2ea32)
    function applyUnreadBadgeStyles(element) {
        element.style.setProperty('background-color', UNREAD_BADGE_COLOR, 'important');
    }

    // Process all relevant targets on a node
    function processElements(container) {
        // Handle side pills
        if (container.classList && container.classList.contains('item__58105')) applyPillStyles(container);
        container.querySelectorAll('.item__58105').forEach(applyPillStyles);

        // Handle unread badges
        if (container.classList && container.classList.contains('unread__2ea32')) applyUnreadBadgeStyles(container);
        container.querySelectorAll('.unread__2ea32').forEach(applyUnreadBadgeStyles);
    }

    // Initial run
    processElements(document);

    // Watch for new elements or style overrides
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        processElements(node);
                    }
                });
            } else if (mutation.type === 'attributes') {
                const target = mutation.target;
                if (!target.classList) continue;

                const currentBg = target.style.backgroundColor;

                // Check side pills
                if (target.classList.contains('item__58105')) {
                    const currentHeight = target.style.height;
                    if (currentHeight === '40px' && currentBg !== targetActiveRgb) {
                        applyPillStyles(target);
                    } else if (currentHeight !== '40px' && currentBg !== targetPassiveRgb) {
                        applyPillStyles(target);
                    }
                }

                // Check unread badges
                if (target.classList.contains('unread__2ea32')) {
                    if (currentBg !== targetUnreadRgb) {
                        applyUnreadBadgeStyles(target);
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
    });
})();