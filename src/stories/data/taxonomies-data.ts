import {gql} from "@apollo/client";

export const allTaxonomiesData = {
    request: {
        query: gql`
                query GetAllTaxonomies {
                  taxonomies {
                    edges {
                      node {
                        id
                        label
                        name
                        description
                      }
                    }
                  }
                }
            `,
    },
    result: {
        data: {
            taxonomies: {
                edges: [
                    {
                        node: {
                            id: "1",
                            label: "Category",
                            name: "category",
                            description: "Categories for posts",
                        },
                    },
                    // Add more taxonomies as needed
                ],
            },
        },
    },
};

export const taxonomyByIdData = {
    request: {
        query: gql`
                query GetTaxonomyById($taxonomyId: Int!) {
                  taxonomy(id: $taxonomyId, idType: ID) {
                    edges {
                      node {
                        id
                        label
                        name
                        description
                      }
                    }
                  }
                }
            `,
            variables: {
            taxonomyId: 1,
        },
    },
    result: {
        data: {
            taxonomy: {
                edges: [
                    {
                        node: {
                            id: "1",
                            label: "Category",
                            name: "category",
                            description: "Categories for posts",
                        },
                    },
                ],
            },
        },
    },
};

export const termsByTaxonomyData = {
    request: {
        query: gql`
                query GetTermsByTaxonomy($taxonomy: ID!) {
                  terms(where: { taxonomies: $taxonomy }) {
                    edges {
                      node {
                        description
                        id
                        link
                        name
                        slug
                        taxonomyName
                        uri
                      }
                    }
                  }
                }
            `,
            variables: {
            taxonomy: "category",
        },
    },
    result: {
        data: {
            terms: {
                edges: [
                    {
                        node: {
                            description: "Term description",
                            id: "term-1",
                            link: "http://example.com/term-1",
                            name: "Term 1",
                            slug: "term-1",
                            taxonomyName: "category",
                            uri: "/term/term-1",
                        },
                    },
                ],
            },
        },
    },
};

export default allTaxonomiesData;