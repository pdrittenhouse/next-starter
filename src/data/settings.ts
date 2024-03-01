import {gql} from "@apollo/client";

export const GET_ALL_SETTINGS = gql`
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
`;

export const GET_GENERAL_SETTINGS = gql`
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
`;

export const GET_READING_SETTINGS = gql`
  query GetReadingSettings {
    readingSettings {
      pageForPosts
      pageOnFront
      postsPerPage
      showOnFront
    }
  }
`;

export const GET_DISCUSSION_SETTINGS = gql`
  query GetDiscussionSettings {
    discussionSettings {
      defaultCommentStatus
      defaultPingStatus
    }
  }
`;

export const GET_WRITING_SETTINGS = gql`
  query GetWritingSettings {
    writingSettings {
      defaultCategory
      defaultPostFormat
      useSmilies
    }
  }
`;

export default GET_ALL_SETTINGS;