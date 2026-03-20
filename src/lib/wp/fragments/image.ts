import { gql } from "@apollo/client";

/** Core image fields used everywhere (featured images, gallery, media). */
export const IMAGE_FIELDS = gql`
  fragment ImageFields on MediaItem {
    id
    sourceUrl
    altText
    caption
    srcSet
    sizes
  }
`;
