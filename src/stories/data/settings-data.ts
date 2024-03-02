import {gql} from "@apollo/client";

export const allSettingsData = {
    request: {
        query: gql`
                query GetAllSettings {
                  allSettings {
                    discussionSettingsDefaultCommentStatus
                    discussionSettingsDefaultPingStatus
                    generalSettingsDateFormat
                    generalSettingsDescription
                    generalSettingsLanguage
                    generalSettingsStartOfWeek
                    generalSettingsTimeFormat
                    generalSettingsTimezone
                    generalSettingsTitle
                    generalSettingsUrl
                    readingSettingsPageForPosts
                    readingSettingsPageOnFront
                    readingSettingsPostsPerPage
                    readingSettingsShowOnFront
                    writingSettingsDefaultCategory
                    writingSettingsDefaultPostFormat
                    writingSettingsUseSmilies
                  }
                }
            `,
    },
    result: {
        data: {
            allSettings: {
                discussionSettingsDefaultCommentStatus: 'open',
                    discussionSettingsDefaultPingStatus: 'open',
                    generalSettingsDateFormat: 'F j, Y',
                    generalSettingsDescription: 'Site description here',
                    generalSettingsLanguage: 'en-US',
                    generalSettingsStartOfWeek: 'sunday',
                    generalSettingsTimeFormat: 'g:i a',
                    generalSettingsTimezone: 'UTC',
                    generalSettingsTitle: 'Site Title',
                    generalSettingsUrl: 'http://example.com',
                    readingSettingsPageForPosts: '0',
                    readingSettingsPageOnFront: '0',
                    readingSettingsPostsPerPage: '10',
                    readingSettingsShowOnFront: 'posts',
                    writingSettingsDefaultCategory: '1',
                    writingSettingsDefaultPostFormat: 'standard',
                    writingSettingsUseSmilies: true,
            },
        },
    },
};

export const generalSettingsData = {
    request: {
        query: gql`
                query GetGeneralSettings {
                  generalSettings {
                    description
                    dateFormat
                    language
                    startOfWeek
                    timeFormat
                    timezone
                    title
                    url
                  }
                }
            `,
    },
    result: {
        data: {
            generalSettings: {
                description: 'Site description here',
                    dateFormat: 'F j, Y',
                    language: 'en-US',
                    startOfWeek: 'sunday',
                    timeFormat: 'g:i a',
                    timezone: 'UTC',
                    title: 'Site Title',
                    url: 'http://example.com',
            },
        },
    },
};

export const readingSettingsData = {
    request: {
        query: gql`
                query GetReadingSettings {
                  readingSettings {
                    pageForPosts
                    pageOnFront
                    postsPerPage
                    showOnFront
                  }
                }
            `,
    },
    result: {
        data: {
            readingSettings: {
                pageForPosts: '0',
                    pageOnFront: '0',
                    postsPerPage: '10',
                    showOnFront: 'posts',
            },
        },
    },
};

export const discussionSettingsData = {
    request: {
        query: gql`
                query GetDiscussionSettings {
                  discussionSettings {
                    defaultCommentStatus
                    defaultPingStatus
                  }
                }
            `,
    },
    result: {
        data: {
            discussionSettings: {
                defaultCommentStatus: 'open',
                    defaultPingStatus: 'open',
            },
        },
    },
};

export const writingSettingsData = {
    request: {
        query: gql`
                query GetWritingSettings {
                  writingSettings {
                    defaultCategory
                    defaultPostFormat
                    useSmilies
                  }
                }
            `,
    },
    result: {
        data: {
            writingSettings: {
                defaultCategory: '1',
                    defaultPostFormat: 'standard',
                    useSmilies: true,
            },
        },
    },
};

export default allSettingsData;