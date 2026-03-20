import { gql } from "@apollo/client";

/** Author fields used in post/page queries. */
export const AUTHOR_FIELDS = gql`
  fragment AuthorFields on User {
    id
    name
    slug
    avatar {
      url
      height
      width
    }
  }
`;
