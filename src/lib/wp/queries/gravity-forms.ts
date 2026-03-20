import {gql} from "@apollo/client";

export const GET_ALL_GRAVITY_FORMS = gql`
    query GetAllGravityForms {
      gfForms(first: 100) {
        edges {
          node {
            id
            databaseId
            title
            description
            isActive
            dateCreated
            cssClass
            submitButton {
              text
              type
            }
            confirmations {
              id
              name
              type
              message
              url
            }
            formFields(first: 500) {
              edges {
                node {
                  id
                  databaseId
                  type
                  label
                  description
                  cssClass
                  isRequired
                  ... on TextField {
                    placeholder
                    defaultValue
                    maxLength
                  }
                  ... on TextAreaField {
                    placeholder
                    defaultValue
                    maxLength
                  }
                  ... on EmailField {
                    placeholder
                  }
                  ... on PhoneField {
                    placeholder
                    phoneFormat
                  }
                  ... on NumberField {
                    placeholder
                    rangeMin
                    rangeMax
                    numberFormat
                  }
                  ... on SelectField {
                    placeholder
                    choices {
                      text
                      value
                      isSelected
                    }
                  }
                  ... on RadioField {
                    choices {
                      text
                      value
                      isSelected
                    }
                  }
                  ... on CheckboxField {
                    choices {
                      text
                      value
                      isSelected
                    }
                  }
                  ... on HiddenField {
                    defaultValue
                  }
                  ... on HtmlField {
                    content
                  }
                  ... on FileUploadField {
                    maxFileSize
                    allowedExtensions
                  }
                  ... on DateField {
                    placeholder
                    dateFormat
                  }
                  ... on TimeField {
                    timeFormat
                  }
                  ... on WebsiteField {
                    placeholder
                    defaultValue
                  }
                }
              }
            }
          }
        }
      }
    }
`;

export const GET_GRAVITY_FORM_ENTRIES = gql`
    query GetGravityFormEntries($formId: ID!) {
      gfEntries(where: { formIds: [$formId] }, first: 100) {
        edges {
          node {
            id
            databaseId
            dateCreated
            status
            isRead
            isStarred
            ip
            userAgent
            formFields {
              edges {
                node {
                  ... on TextField { value }
                  ... on TextAreaField { value }
                  ... on EmailField { value }
                  ... on NumberField { value }
                  ... on SelectField { value }
                  ... on RadioField { value }
                  ... on CheckboxField { checkboxValues { value } }
                }
              }
            }
          }
        }
      }
    }
`;

export default GET_ALL_GRAVITY_FORMS;
