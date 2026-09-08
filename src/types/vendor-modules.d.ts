/**
 * Ambient declarations for third-party modules whose shipped types don't cover
 * the way this project imports them.
 *
 * Without these, `next build` fails at its type-check stage even though the
 * webpack compile succeeds — so the app has no production build path.
 */

// ─── Bootstrap deep imports ──────────────────────────────────────────────────
//
// Bootstrap 5 ships type declarations for the package root (`bootstrap`) but not
// for the individual ES sources under `bootstrap/js/src/*`. PatternInit imports
// those directly to avoid pulling the whole bundle into the client, which leaves
// them implicitly `any` and trips TS7016 under `strict`.
//
// Declared as the class shapes actually used rather than blanket `any`, so call
// sites still get a little checking.

declare module 'bootstrap/js/src/tooltip' {
  export default class Tooltip {
    constructor(element: Element, options?: Record<string, unknown>);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    static getInstance(element: Element): Tooltip | null;
    static getOrCreateInstance(element: Element, options?: Record<string, unknown>): Tooltip;
  }
}

declare module 'bootstrap/js/src/popover' {
  export default class Popover {
    constructor(element: Element, options?: Record<string, unknown>);
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
    static getInstance(element: Element): Popover | null;
    static getOrCreateInstance(element: Element, options?: Record<string, unknown>): Popover;
  }
}

declare module 'bootstrap/js/src/toast' {
  export default class Toast {
    constructor(element: Element, options?: Record<string, unknown>);
    show(): void;
    hide(): void;
    dispose(): void;
    static getInstance(element: Element): Toast | null;
    static getOrCreateInstance(element: Element, options?: Record<string, unknown>): Toast;
  }
}

declare module 'bootstrap/js/src/scrollspy' {
  export default class ScrollSpy {
    constructor(element: Element, options?: Record<string, unknown>);
    refresh(): void;
    dispose(): void;
    static getInstance(element: Element): ScrollSpy | null;
    static getOrCreateInstance(element: Element, options?: Record<string, unknown>): ScrollSpy;
  }
}

// ─── slick-carousel ──────────────────────────────────────────────────────────
//
// `@types/slick-carousel` is ambient only — it augments the jQuery interface and
// exports nothing, so `await import('slick-carousel')` reports TS2306 ("is not a
// module"). The import is for its side effect of registering `$.fn.slick`, so an
// empty module declaration is the accurate shape.

declare module 'slick-carousel' {
  const slick: void;
  export default slick;
}
