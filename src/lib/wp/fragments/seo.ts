import { gql } from "@apollo/client";

/** Per-content SEO fields (Yoast/RankMath via custom resolver). */
export const SEO_FIELDS = gql`
  fragment SeoFields on ContentNodeSeo {
    title
    description
    canonicalUrl
    ogTitle
    ogDescription
    ogImage
    ogType
    twitterTitle
    twitterDescription
    twitterImage
    twitterCard
    robots
    schema
  }
`;

/**
 * Inline SEO selection string for use in dynamic query builders
 * where gql fragment interpolation isn't practical.
 */
export const SEO_SELECTION = `
  seo {
    title
    description
    canonicalUrl
    ogTitle
    ogDescription
    ogImage
    ogType
    twitterTitle
    twitterDescription
    twitterImage
    twitterCard
    robots
    schema
  }
`;
