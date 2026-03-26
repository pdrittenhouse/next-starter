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
 */
export const GET_COMMENTS_BY_POST = gql`
  query GetCommentsByPost($contentId: ID!) {
    comments(where: { contentId: $contentId, orderby: COMMENT_DATE, order: ASC }, first: 100) {
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
