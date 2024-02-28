import {gql} from "@apollo/client";

export const GET_TOASTERS = gql`
  query GetToasters {
  toasters {
    edges {
      node {
        id
        title
        slug
      }
    }
  }
}
`