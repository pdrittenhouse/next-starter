import {gql} from "@apollo/client";

export const GET_WIDGET_AREAS = gql`
    query GetWidgetAreas {
      widgetAreas {
        id
        name
        widgets {
          id
          type
          title
          settings
        }
      }
    }
`;

/**
 * Fetch a single widget area rendered as HTML.
 * Uses the framework's widgetArea(slug) resolver which calls dynamic_sidebar()
 * server-side and returns the output as a string. Returns null when the area
 * is empty or the slug is not registered.
 */
export const GET_WIDGET_AREA = gql`
  query GetWidgetArea($slug: String!) {
    widgetArea(slug: $slug)
  }
`;

export const GET_WIDGET_AREA_BLOCKS = gql`
  query GetWidgetAreaBlocks($slug: String!) {
    widgetAreaBlocks(slug: $slug) {
      name
      clientId
      parentClientId
      renderedHtml
      attributesJSON
    }
  }
`;

/**
 * Returns only the user-created widget areas from Menu & Widget Options.
 * Does not include the built-in framework areas (header, footer, sidebars).
 * Use this for discovering custom area slugs without hardcoding them.
 */
export const GET_CUSTOM_WIDGET_AREAS = gql`
  query GetCustomWidgetAreas {
    customWidgetAreas {
      id
      name
    }
  }
`;

export default GET_WIDGET_AREAS;
