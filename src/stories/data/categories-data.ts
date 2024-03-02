import {gql} from "@apollo/client";

export const allCategoriesData = {
    request: {
        query: gql`
                query GetAllCategories {
                  categories(first: 10000) {
                    edges {
                      node {
                          databaseId
                          description
                          id
                          name
                          slug
                          isRestricted
                          isContentNode
                          isTermNode
                          link
                          count
                          categoryId
                          parentDatabaseId
                          parentId
                          taxonomyName
                          termGroupId
                          termTaxonomyId
                          uri
                      }
                    }
                  }
                }
            `,
    },
    result: {
        data: {
            categories: {
                edges: [
                    {
                        node: {
                            databaseId: '1',
                            description: 'Category description',
                            id: 'category-1',
                            name: 'Category 1',
                            slug: 'category-1',
                            isRestricted: false,
                            isContentNode: true,
                            isTermNode: true,
                            link: 'http://example.com/category-1',
                            count: 10,
                            categoryId: 1,
                            parentDatabaseId: '0',
                            parentId: null,
                            taxonomyName: 'category',
                            termGroupId: 0,
                            termTaxonomyId: 1,
                            uri: '/category-1',
                        },
                    },
                    {
                        node: {
                            databaseId: '2',
                            description: 'Category description',
                            id: 'category-2',
                            name: 'Category 2',
                            slug: 'category-2',
                            isRestricted: false,
                            isContentNode: true,
                            isTermNode: true,
                            link: 'http://example.com/category-2',
                            count: 8,
                            categoryId: 2,
                            parentDatabaseId: '0',
                            parentId: null,
                            taxonomyName: 'category',
                            termGroupId: 0,
                            termTaxonomyId: 2,
                            uri: '/category-2',
                        },
                    },
                    // Add more categories as needed
                ],
            },
        },
    },
};

export const categoryBySlugData = {
    request: {
        query: gql`
                query GetCategoryBySlug($slug: ID!) {
                  category(id: $slug, idType: SLUG) {
                    databaseId
                    description
                    id
                    name
                    slug
                  }
                }
            `,
    },
    result: {
        data: {
            category: {
                databaseId: '1',
                description: 'Category description',
                id: 'category-1',
                name: 'Category 1',
                slug: 'category-1',
            },
        },
    },
};

export default allCategoriesData;
