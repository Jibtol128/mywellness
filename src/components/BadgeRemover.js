'use client';

import { useEffect } from 'react';

export default function BadgeRemover() {
  useEffect(() => {
    const removeDevBadge = () => {
      const selectors = [
        '[data-next-badge="true"]',
        '[data-nextjs-dev-tools-button="true"]',
        '[data-nextjs-dev-tools-modal="true"]',
        '[data-nextjs-data-runtime-error="true"]'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      });
    };

    // Add a style tag to forcefully hide the badge
    const style = document.createElement('style');
    style.textContent = `
      [data-next-badge="true"],
      [data-nextjs-dev-tools-button="true"],
      [data-nextjs-dev-tools-modal="true"],
      [data-nextjs-data-runtime-error="true"],
      [data-nextjs-call-stack-frame="true"],
      [data-nextjs-collapsed-call-stack="true"],
      [data-nextjs-terminal="true"] {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    // Remove immediately
    removeDevBadge();

    // Set up interval to continuously check and remove
    const intervalId = setInterval(removeDevBadge, 100);

    // Also set up mutation observer to catch any that appear
    const observer = new MutationObserver(() => {
      removeDevBadge();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up
    return () => {
      clearInterval(intervalId);
      observer.disconnect();
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
}
