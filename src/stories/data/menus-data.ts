import {gql} from "@apollo/client";

export const menusData = {
    request: {
        query: gql`
                query GetAllMenus {
                  menus {
                    nodes {
                      id
                      databaseId
                      name
                      menuItems {
                        edges {
                          node {
                            id
                            label
                            parentId
                            cssClasses
                            description
                            locations
                            menuItemId
                            order
                            path
                            target
                            url
                            title
                          }
                        }
                      }
                      locations
                      menuId
                      slug
                    }
                  }
                }
            `,
    },
    result: {
        data: {
            menus: {
                nodes: [
                    {
                        id: '1',
                        databaseId: 1,
                        name: 'Primary',
                        menuItems: {
                            edges: [
                                {
                                    node: {
                                        id: '1',
                                        label: 'Home',
                                        parentId: null,
                                        cssClasses: 'menu-item menu-item-type-post_type menu-item-object-page',
                                        description: '',
                                        locations: ['primary'],
                                        menuItemId: 1,
                                        order: 1,
                                        path: '/',
                                        target: '',
                                        url: 'http://example.com/',
                                        title: 'Home',
                                    },
                                },
                                {
                                    node: {
                                        id: '2',
                                        label: 'About Us',
                                        parentId: null,
                                        cssClasses: 'menu-item menu-item-type-post_type menu-item-object-page',
                                        description: '',
                                        locations: ['primary'],
                                        menuItemId: 2,
                                        order: 2,
                                        path: '/about',
                                        target: '',
                                        url: 'http://example.com/about',
                                        title: 'About Us',
                                    },
                                },
                                {
                                    node: {
                                        id: '3',
                                        label: 'Contact',
                                        parentId: null,
                                        cssClasses: 'menu-item menu-item-type-post_type menu-item-object-page',
                                        description: '',
                                        locations: ['primary'],
                                        menuItemId: 3,
                                        order: 3,
                                        path: '/contact',
                                        target: '',
                                        url: 'http://example.com/contact',
                                        title: 'Contact',
                                    },
                                },
                            ],
                        },
                        locations: ['primary'],
                        menuId: 'primary',
                        slug: 'primary-menu',
                    },
                    {
                        id: '2',
                        databaseId: 2,
                        name: 'Social',
                        menuItems: {
                            edges: [
                                {
                                    node: {
                                        id: '4',
                                        label: 'Facebook',
                                        parentId: null,
                                        cssClasses: 'menu-item menu-item-type-custom menu-item-object-custom',
                                        description: '',
                                        locations: ['social'],
                                        menuItemId: 4,
                                        order: 1,
                                        path: '',
                                        target: '_blank',
                                        url: 'http://facebook.com',
                                        title: 'Facebook',
                                    },
                                },
                                {
                                    node: {
                                        id: '5',
                                        label: 'Twitter',
                                        parentId: null,
                                        cssClasses: 'menu-item menu-item-type-custom menu-item-object-custom',
                                        description: '',
                                        locations: ['social'],
                                        menuItemId: 5,
                                        order: 2,
                                        path: '',
                                        target: '_blank',
                                        url: 'http://twitter.com',
                                        title: 'Twitter',
                                    },
                                },
                                {
                                    node: {
                                        id: '6',
                                        label: 'Instagram',
                                        parentId: null,
                                        cssClasses: 'menu-item menu-item-type-custom menu-item-object-custom',
                                        description: '',
                                        locations: ['social'],
                                        menuItemId: 6,
                                        order: 3,
                                        path: '',
                                        target: '_blank',
                                        url: 'http://instagram.com',
                                        title: 'Instagram',
                                    },
                                },
                            ],
                        },
                        locations: ['social'],
                        menuId: 'social',
                        slug: 'social-menu',
                    },
                    {
                        id: '3',
                        databaseId: 3,
                        name: 'Footer',
                        menuItems: {
                            edges: [
                                {
                                    node: {
                                        id: '7',
                                        label: 'Privacy Policy',
                                        parentId: null,
                                        cssClasses: 'menu-item menu-item-type-custom menu-item-object-custom',
                                        description: '',
                                        locations: ['footer'],
                                        menuItemId: 7,
                                        order: 1,
                                        path: '',
                                        target: '',
                                        url: 'http://example.com/privacy-policy',
                                        title: 'Privacy Policy',
                                    },
                                },
                                {
                                    node: {
                                        id: '8',
                                        label: 'Terms of Service',
                                        parentId: null,
                                        cssClasses: 'menu-item menu-item-type-custom menu-item-object-custom',
                                        description: '',
                                        locations: ['footer'],
                                        menuItemId: 8,
                                        order: 2,
                                        path: '',
                                        target: '',
                                        url: 'http://example.com/terms-of-service',
                                        title: 'Terms of Service',
                                    },
                                },
                                {
                                    node: {
                                        id: '9',
                                        label: 'FAQ',
                                        parentId: null,
                                        cssClasses: 'menu-item menu-item-type-custom menu-item-object-custom',
                                        description: '',
                                        locations: ['footer'],
                                        menuItemId: 9,
                                        order: 3,
                                        path: '',
                                        target: '',
                                        url: 'http://example.com/faq',
                                        title: 'FAQ',
                                    },
                                },
                            ],
                        },
                        locations: ['footer'],
                        menuId: 'footer',
                        slug: 'footer-menu',
                    },
                ],
            },
        },
    },
};

export default menusData;