'use client';
import { useEffect } from 'react';

interface PostNode {
  uri?: string;
  title?: string;
  excerpt?: string;
  featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

function parseFields(el: HTMLElement): Record<string, unknown> | null {
  const raw = el.getAttribute('data-fields');
  if (!raw) return null;
  try { return JSON.parse(raw.replace(/'/g, '"')); } catch { return null; }
}

function renderPost(post: PostNode, pattern: string): string {
  const uri = post.uri ?? '#';
  const title = post.title ?? '';
  const excerpt = post.excerpt ?? '';
  const img = post.featuredImage?.node;
  const imgHtml = img
    ? `<a href="${uri}" class="card--image-link"><img src="${img.sourceUrl ?? ''}" alt="${img.altText ?? ''}" class="card-img-top"></a>`
    : '';
  if (pattern === 'list') {
    return `<li class="posts-loop--post-list-item list-group-item"><a href="${uri}">${title}</a></li>`;
  }
  return `<div class="posts-loop--post card h-100">${imgHtml}<div class="card-body"><h3 class="card-title h5"><a href="${uri}">${title}</a></h3>${excerpt ? `<div class="card-text">${excerpt}</div>` : ''}</div></div>`;
}

export function PostsLoopClient() {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.posts-loop').forEach(wrapper => {
      const btn = wrapper.querySelector<HTMLButtonElement>('.load-more--button');
      if (!btn) return;
      const fields = parseFields(wrapper);
      if (!fields) return;

      const perPage = (fields.posts_per_page as number) ?? 10;
      const pattern = (fields.pattern as string) ?? 'card';
      const categoryId = (() => {
        const c = (fields.categories ?? fields.category) as unknown;
        if (!c) return null;
        const id = Array.isArray(c) ? c[0] : c;
        const n = Number(id);
        return isNaN(n) ? null : n;
      })();
      const tagId = (() => {
        const t = (fields.tag ?? fields.tags) as unknown;
        if (!t) return null;
        return String(Array.isArray(t) ? t[0] : t);
      })();
      const authorName = (() => {
        const a = fields.author as unknown;
        if (!a) return null;
        return String(Array.isArray(a) ? a[0] : a);
      })();
      const search = (fields.search as string) ?? null;

      let cursor: string | null = null;

      const baseBody = { perPage, categoryId, tagId, authorName, search };

      fetch('/api/posts-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseBody, cursor: null }),
      })
        .then(r => r.json())
        .then((data: { nodes: PostNode[]; pageInfo: PageInfo }) => {
          if (!data.pageInfo?.hasNextPage) {
            btn.style.display = 'none';
            return;
          }
          cursor = data.pageInfo.endCursor;
          btn.addEventListener('click', async () => {
            btn.disabled = true;
            try {
              const res = await fetch('/api/posts-loop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...baseBody, cursor }),
              });
              const d: { nodes: PostNode[]; pageInfo: PageInfo } = await res.json();
              const postsWrapper = wrapper.querySelector<HTMLElement>('.posts-loop--posts-wrapper');
              const listEl = pattern === 'list' ? postsWrapper?.querySelector<HTMLElement>('.posts-loop--post-list') : null;
              const target = listEl ?? postsWrapper;
              if (target && d.nodes?.length) {
                target.insertAdjacentHTML('beforeend', d.nodes.map(n => renderPost(n, pattern)).join(''));
              }
              cursor = d.pageInfo?.endCursor ?? null;
              if (!d.pageInfo?.hasNextPage) btn.style.display = 'none';
            } finally {
              btn.disabled = false;
            }
          });
        })
        .catch(() => { /* WP unreachable, leave button visible */ });
    });
  }, []);

  return null;
}
