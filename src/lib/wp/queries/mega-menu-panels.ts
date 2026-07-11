import {gql} from "@apollo/client";

export const GET_ALL_MEGA_MENU_PANELS = gql`
    query GetAllMegaMenuPanels {
      megaMenuPanels(first: 100) {
        edges {
          node {
            id
            databaseId
            title
            content
            date
            modified
            status
          }
        }
      }
    }
`;

export const GET_MEGA_MENU_PANEL_BY_ID = gql`
    query GetMegaMenuPanelById($id: ID!) {
      megaMenuPanel(id: $id, idType: DATABASE_ID) {
        id
        databaseId
        title
        content
        date
        modified
        status
      }
    }
`;

export default GET_ALL_MEGA_MENU_PANELS;
