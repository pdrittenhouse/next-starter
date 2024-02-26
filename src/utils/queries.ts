import { gql } from "@apollo/client";

const GET_TOASTERS = gql`
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

export default GET_TOASTERS;