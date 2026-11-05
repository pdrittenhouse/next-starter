'use strict';

/**
 * Properties captured by the computed-style gate.
 *
 * Deliberately ~60 of the ~340 `getComputedStyle` exposes. The full set is mostly
 * noise — unset shorthands, vendor aliases and values that never change — and it
 * buries real regressions in a diff nobody reads.
 *
 * The three groups map to the three ways this codebase can break CSS:
 *
 *   LAYOUT      PurgeCSS dropping a rule, or tier de-duplication reordering the
 *               cascade, shows up here first. Also the only group that can cause CLS.
 *   TYPOGRAPHY  Affects layout as well as appearance, and is heavily themed.
 *   PAINT       Where X10/X11 regressions land: a Bootstrap component variable that
 *               stops being re-emitted changes colour, not geometry.
 *
 * Adding a property invalidates every baseline (it appears as a diff on every
 * element). Removing one is safe. Treat additions as a deliberate re-baseline.
 */

const LAYOUT = [
  'display', 'position', 'top', 'right', 'bottom', 'left',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'box-sizing',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
  'align-items', 'align-self', 'justify-content',
  'gap', 'row-gap', 'column-gap', 'order',
  'grid-template-columns', 'grid-template-rows',
  'float', 'clear', 'overflow-x', 'overflow-y',
  'aspect-ratio', 'z-index', 'transform',
];

const TYPOGRAPHY = [
  'font-family', 'font-size', 'font-weight', 'font-style',
  'line-height', 'letter-spacing',
  'text-align', 'text-transform', 'white-space', 'text-decoration-line',
];

const PAINT = [
  'color', 'background-color', 'background-image',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-radius', 'box-shadow', 'opacity', 'visibility',
  'outline-color', 'outline-width',
];

const ALL = [...LAYOUT, ...TYPOGRAPHY, ...PAINT];

module.exports = { LAYOUT, TYPOGRAPHY, PAINT, ALL };
