import {gql} from "@apollo/client";

export const GET_SEO_SETTINGS = gql`
    query GetSeoSettings {
      seoSettings {
        plugin
        separator
        siteTitle
        siteDescription
        defaultOgImage
        socialProfiles {
          facebook
          twitter
          instagram
          linkedIn
          youTube
          pinterest
          mySpace
          soundCloud
          tumblr
          wikipedia
        }
        webmaster {
          google
          bing
          yandex
          pinterest
          baidu
          norton
        }
        schema {
          organizationName
          organizationLogo
          organizationType
          personName
          siteUrl
        }
        breadcrumbs {
          enabled
          separator
          homeText
          prefix
          showBlogPage
        }
      }
    }
`;

export default GET_SEO_SETTINGS;
