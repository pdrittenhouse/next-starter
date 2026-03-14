import {gql} from "@apollo/client";

export const GET_ALL_MEDIA_ITEMS = gql`
    query GetAllMediaItems {
      mediaItems(first: 100) {
        edges {
          node {
            id
            databaseId
            title
            altText
            caption
            description
            sourceUrl
            srcSet
            sizes
            mediaItemUrl
            mimeType
            mediaType
            fileSize
            date
            modified
            slug
            status
            mediaDetails {
              height
              width
              file
              sizes {
                name
                sourceUrl
                width
                height
                mimeType
              }
            }
          }
        }
      }
    }
`;

export const GET_MEDIA_ITEM_BY_ID = gql`
    query GetMediaItemById($id: ID!) {
      mediaItem(id: $id, idType: DATABASE_ID) {
        id
        databaseId
        title
        altText
        caption
        description
        sourceUrl
        srcSet
        sizes
        mediaItemUrl
        mimeType
        mediaType
        fileSize
        mediaDetails {
          height
          width
          file
          sizes {
            name
            sourceUrl
            width
            height
            mimeType
          }
        }
      }
    }
`;

export default GET_ALL_MEDIA_ITEMS;
