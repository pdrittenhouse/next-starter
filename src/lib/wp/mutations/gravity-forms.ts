import {gql} from "@apollo/client";

/**
 * Submit a Gravity Forms form entry.
 * Requires WPGraphQL for Gravity Forms plugin.
 *
 * fieldValues accepts an array of { id, value } objects.
 * For complex field types use the appropriate sub-input:
 *   - Multi-select / checkboxes: { id, values: ["a", "b"] }
 *   - Email with confirmation:   { id, emailValues: { value, confirmationValue } }
 *   - Name field:                { id, nameValues: { first, last } }
 *   - Address field:             { id, addressValues: { street, city, state, zip, country } }
 *   - List field:                { id, listValues: [{ rowValues: ["col1", "col2"] }] }
 */
export const SUBMIT_GRAVITY_FORM = gql`
  mutation SubmitGravityForm($formId: ID!, $fieldValues: [FormFieldValuesInput]!) {
    submitGfForm(input: {
      id: $formId
      fieldValues: $fieldValues
    }) {
      errors {
        id
        message
      }
      entry {
        id
        formId
        status
      }
      confirmation {
        message
        type
        url
      }
    }
  }
`;

export default SUBMIT_GRAVITY_FORM;
