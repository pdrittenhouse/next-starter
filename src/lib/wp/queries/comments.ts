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

export default GET_ALL_COMMENTS;
