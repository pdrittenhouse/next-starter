import {gql} from "@apollo/client";

/**
 * Submit a new comment on a post or page.
 * Requires discussion settings to allow comments.
 * Unauthenticated submissions respect the site's moderation settings.
 */
export const CREATE_COMMENT = gql`
  mutation CreateComment(
    $postId: Int!
    $content: String!
    $authorName: String
    $authorEmail: String
    $authorUrl: String
    $parentId: ID
  ) {
    createComment(input: {
      commentOn: $postId
      content: $content
      author: $authorName
      authorEmail: $authorEmail
      authorUrl: $authorUrl
      parent: $parentId
    }) {
      success
      comment {
        id
        databaseId
        content
        date
        approved
        author {
          node {
            name
            ... on CommentAuthor {
              email
              url
            }
          }
        }
        parent {
          node {
            id
          }
        }
      }
    }
  }
`;

export default CREATE_COMMENT;
