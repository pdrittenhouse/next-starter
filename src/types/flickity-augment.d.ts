// Augments @types/flickity, which predates Flickity 3 and omits options the
// current release supports (`fullscreen`, `fade`).
//
// Getting the shape right took some care, so recording it:
//
//  1. The file must be a MODULE — note the `import` below. As a global script
//     file, `declare module 'flickity'` *replaces* the package's declaration
//     instead of merging, which makes `new Flickity(...)` report TS2351
//     "expression is not constructable".
//
//  2. `declare module 'flickity' { interface Options { ... } }` does NOT work:
//     the package uses `export = Flickity` with `declare namespace Flickity {
//     interface Options }`, so Options is namespace-scoped, not top-level.
//
//  3. `declare module 'flickity' { namespace Flickity { interface Options } }`
//     also does not work.
//
//  4. This does. The package also declares `export as namespace Flickity`, so
//     it publishes a UMD global namespace, and augmenting *that* merges into
//     the same Options the constructor signature refers to.
//
// Beware when verifying: TS2353 names only ONE excess property per object
// literal, so a failed augmentation can look like partial success as the
// reported name shifts. Confirm with a probe that uses each option alone.
import 'flickity';

declare global {
  namespace Flickity {
    interface Options {
      /** Flickity 3: adds a fullscreen toggle button. Absent from @types/flickity. */
      fullscreen?: boolean;
      /** Flickity 3: cross-fades between slides instead of sliding. Absent from @types/flickity. */
      fade?: boolean;
    }
  }
}
