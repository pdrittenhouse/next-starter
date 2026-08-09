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

    document.querySelectorAll<HTMLElement>('.block-social-share').forEach(block => {
      const copied = block.querySelector<HTMLElement>('.copied');
      block.querySelectorAll<HTMLElement>('.social-nav-item').forEach(item => {
        const link = item.querySelector<HTMLAnchorElement>('.social-nav-link');
        if (!link) return;
        if (item.classList.contains('service-copy')) {
          link.addEventListener('click', e => {
            e.preventDefault();
            navigator.clipboard?.writeText(item.dataset.clipboardText ?? link.href);
            if (copied) {
              copied.classList.remove('hide');
              setTimeout(() => copied.classList.add('hide'), 1500);
            }
          });
        } else if (!item.classList.contains('service-email')) {
          const href = link.getAttribute('href') ?? '';
          link.addEventListener('click', e => {
            e.preventDefault();
            window.open(href, '_blank', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
          });
        }
      });
    });

    document.querySelectorAll<HTMLElement>('.block-tabs.jquery').forEach(block => {
      const tabsEl = block.querySelector<HTMLElement>('.tabs');
      if (!tabsEl || tabsEl.querySelector('.tabs__tab')) return;
      block.querySelectorAll<HTMLElement>('.tabs__content-wrapper').forEach(wrapper => {
        const id = wrapper.id;
        const label = wrapper.dataset.label ?? '';
        tabsEl.insertAdjacentHTML('beforeend', `<li class="tabs__tab"><a href="#${id}" class="tabs__tab-link">${label}</a></li>`);
      });
    });

    document.querySelectorAll<HTMLElement>('.block-tabs.bootstrap').forEach(block => {
      const nav = block.querySelector<HTMLElement>('nav .nav');
      if (!nav || nav.querySelector('.nav-link')) return;
      const type = nav.classList.contains('nav-pills') ? 'pill' : 'tab';
      block.querySelectorAll<HTMLElement>('.tab-pane').forEach(pane => {
        const id = pane.id;
        const label = pane.dataset.label ?? '';
        const active = pane.dataset.active === 'show';
        nav.insertAdjacentHTML('beforeend', `<button class="nav-link${active ? ' active' : ''}" data-bs-toggle="${type}" data-bs-target="#${id}" type="button" role="tab">${label}</button>`);
        if (active) pane.classList.add('show', 'active');
      });
    });
  }, []);

  return null;
}
