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

export default GET_WIDGET_AREAS;
