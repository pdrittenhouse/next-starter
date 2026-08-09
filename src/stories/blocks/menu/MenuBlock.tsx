'use client';
import { useEffect } from 'react';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './menu.module.scss';

interface MenuBlockData {
  [key: string]: unknown;
}

interface MenuBlockProps {
  block: EditorBlock;
}

export function MenuBlock({ block }: MenuBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: MenuBlockData; className?: string };
  void attrs;
  void styles;

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.block-menu').forEach(menu => {
      menu.addEventListener('show.bs.collapse', () => {
        menu.querySelector<HTMLElement>('.navbar-toggler')?.classList.add('is-active');
      });
      menu.addEventListener('hide.bs.collapse', () => {
        menu.querySelector<HTMLElement>('.navbar-toggler')?.classList.remove('is-active');
      });
      menu.querySelectorAll<HTMLAnchorElement>('.nav-item a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '/' || href === '#') return;
        if (window.location.href.includes(href)) {
          link.closest('.nav-item')?.classList.add('current');
        }
      });
    });
    if (document.querySelector('.block-menu.has-overlay') && !document.body.classList.contains('has-menu-overlays')) {
      document.body.classList.add('has-menu-overlays');
    }
  }, []);

  if (!block.renderedHtml) return null;
  return <nav dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
}
