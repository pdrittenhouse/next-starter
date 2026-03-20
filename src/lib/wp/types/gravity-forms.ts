/**
 * Gravity Forms types (wp-graphql-gravity-forms plugin).
 */

/** Form field choice (select, radio, checkbox). */
export interface GfFieldChoice {
  text: string;
  value: string;
  isSelected?: boolean;
}

/** Form submit button. */
export interface GfSubmitButton {
  text?: string;
  type?: string;
}

/** Form confirmation. */
export interface GfConfirmation {
  id?: string;
  name?: string;
  type?: string;
  message?: string;
  url?: string;
}

/** Form field node (union of all field types via inline fragments). */
export interface GfFormField {
  id: string;
  databaseId: number;
  type: string;
  label?: string;
  description?: string;
  cssClass?: string;
  isRequired?: boolean;
  /** Text, TextArea, Website fields */
  placeholder?: string;
  defaultValue?: string;
  maxLength?: number;
  /** Phone field */
  phoneFormat?: string;
  /** Number field */
  rangeMin?: number;
  rangeMax?: number;
  numberFormat?: string;
  /** Select, Radio, Checkbox fields */
  choices?: GfFieldChoice[];
  /** HTML field */
  content?: string;
  /** FileUpload field */
  maxFileSize?: number;
  allowedExtensions?: string[];
  /** Date field */
  dateFormat?: string;
  /** Time field */
  timeFormat?: string;
}

/** Gravity Form node. */
export interface GfForm {
  id: string;
  databaseId: number;
  title?: string;
  description?: string;
  isActive?: boolean;
  dateCreated?: string;
  cssClass?: string;
  submitButton?: GfSubmitButton;
  confirmations?: GfConfirmation[];
  formFields?: {
    edges: Array<{ node: GfFormField }>;
  };
}

/** Form entry node. */
export interface GfEntry {
  id: string;
  databaseId: number;
  dateCreated?: string;
  status?: string;
  isRead?: boolean;
  isStarred?: boolean;
  ip?: string;
  userAgent?: string;
  formFields?: {
    edges: Array<{
      node: {
        value?: string;
        checkboxValues?: Array<{ value: string }>;
      };
    }>;
  };
}
