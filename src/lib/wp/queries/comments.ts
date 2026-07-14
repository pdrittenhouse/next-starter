import {gql} from "@apollo/client";

export const GET_ALL_COMMENTS = gql`
    query GetAllComments {
      comments(first: 100) {
        edges {
          node {
            id
            databaseId
            content
            date
            status
            type
            approved
            karma
            parentDatabaseId
            parentId
            author {
              node {
                ... on CommentAuthor {
                  id
                  name
                  email
                  url
                }
              }
            }
            commentedOn {
              node {
                id
                databaseId
                ... on Post {
                  title
                  slug
                }
                ... on Page {
                  title
                  slug
                }
              }
            }
          }
        }
      }
    }
`;

/**
 * Get comments for a specific post/page by its database ID.
 * Returns threaded comments (parentDatabaseId for nesting).
 * Cursor-based pagination: pass $after from pageInfo.endCursor for the next page.
 */
export const GET_COMMENTS_BY_POST = gql`
  query GetCommentsByPost($contentId: ID!, $first: Int = 20, $after: String) {
    comments(
      first: $first
      after: $after
      where: { contentId: $contentId, orderby: COMMENT_DATE, order: ASC }
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          databaseId
          content
          date
          parentDatabaseId
          author {
            node {
              ... on CommentAuthor {
                id
                name
                url
              }
            }
          }
        }
      }
    }
  }
`;

export default GET_ALL_COMMENTS;
