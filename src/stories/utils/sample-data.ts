import {gql} from "@apollo/client";

export const sampleData = [
    {
        request: {
            query: gql`
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
            `,
        },
        result: {
            data: {
                toasters: {
                    edges: [
                        {
                            node: {
                                id: '1',
                                title: 'Toaster 1',
                                slug: 'toaster-1',
                                __typename: 'Toaster',
                            },
                        },
                        {
                            node: {
                                id: '2',
                                title: 'Toaster 2',
                                slug: 'toaster-2',
                                __typename: 'Toaster',
                            },
                        },
                    ],
                    __typename: 'ToasterConnection',
                },
            },
        },
    },
]