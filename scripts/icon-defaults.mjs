/**
 * Icons wanted unconditionally, whatever the scans find.
 *
 * This is the escape hatch for an icon no scan can see: one named only in a `content:`
 * declaration, composed at runtime from a value the stored-value scan does not cover, or
 * needed by a component that has not shipped yet. Everything else should come from the source
 * scan or the content scan — a name added here is a name nothing will ever remove, which is
 * the failure mode `gen-icons.mjs` exists to prevent. Add sparingly, and say why.
 *
 * Names are bare, without the library prefix: `arrow-right`, not `fa-arrow-right`.
 */
export default {
  /** Font Awesome Free, solid + regular (`$icons` in FA's _variables.scss). */
  fa: [],

  /** Font Awesome Free brands (`$brand-icons`). */
  faBrands: [],

  /** Bootstrap Icons (`bootstrap-icons.json`). */
  bi: [],
};
