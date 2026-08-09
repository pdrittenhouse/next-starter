'use client';

import { useEffect } from 'react';

export function PatternInit() {
  useEffect(() => {
    // ── Tooltip + Popover ─────────────────────────────────────────────────────
    import('bootstrap/js/src/tooltip').then(({ default: Tooltip }) => {
      document.querySelectorAll<HTMLElement>('[data-bs-toggle="tooltip"]').forEach(el => new Tooltip(el));
    });
    import('bootstrap/js/src/popover').then(({ default: Popover }) => {
      document.querySelectorAll<HTMLElement>('[data-bs-toggle="popover"]').forEach(el => new Popover(el));
    });

    // ── Toast button wiring ───────────────────────────────────────────────────
    import('bootstrap/js/src/toast').then(({ default: Toast }) => {
      document.querySelectorAll<HTMLElement>('[data-bs-toggle="toast"]').forEach(btn => {
        const target = btn.dataset.bsTarget;
        const toastEl = target ? document.querySelector<HTMLElement>(target) : null;
        if (!toastEl) return;
        const toast = Toast.getOrCreateInstance(toastEl);
        btn.addEventListener('click', () => toast.show());
      });
    });

    // ── YouTube IFrame API injection ──────────────────────────────────────────
    if (document.querySelector('.video-format--youtube') && !(window as any).ytApiInjected) {
      (window as any).ytApiInjected = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }, []);

  return null;
}
