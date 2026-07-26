import styles from './form.module.scss';

export interface FormProps {
  /** Specifies the name of the form. */
  name?: string;
  /** The `id` attribute on the `<form>` element. */
  id?: string;
  /** Maps to the `accept-charset` attribute. */
  charset?: string;
  /** URL that processes the form submission. Maps to `action`. */
  action?: string;
  /** Whether the browser may autofill fields. Defaults to false (off). */
  autocomplete?: boolean;
  /** HTTP method for form submission. */
  method?: 'get' | 'post';
  /** MIME type for form encoding — only applied when method is "post". */
  enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  /** Suppress browser-native validation on submit. */
  noValidate?: boolean;
  /** Where to display the response after submission. */
  target?: '_blank' | '_self' | '_parent' | '_top';
  /** Optional heading rendered as an `<h2>` inside a `<header>` block. */
  heading?: string;
  /** Optional intro content rendered below the heading inside the `<header>` block. */
  intro?: React.ReactNode;
  /** Form fields and controls — maps to the `form_content` Twig block. */
  children?: React.ReactNode;
  /** Optional footer content rendered inside a `<footer>` element. */
  footer?: React.ReactNode;
  /** Additional CSS class names — maps to `form_other_classes` in the Twig pattern. */
  className?: string;
}

function buildClasses(extra?: string): string {
  return ['form', extra ?? null].filter(Boolean).join(' ');
}

/**
 * Form atom — mirrors `src/design-system/patterns/01-atoms/form/_form.tpl.twig`.
 *
 * This is the form shell only: heading, intro, slotted content, and footer.
 * It is not a form builder. Wire up field components as children.
 */
export function Form({
  name,
  id,
  charset,
  action,
  autocomplete = false,
  method,
  enctype,
  noValidate,
  target,
  heading,
  intro,
  children,
  footer,
  className,
}: FormProps) {
  const hasHeader = Boolean(heading || intro);

  // enctype is only meaningful on POST forms per the HTML spec and the Twig template
  const resolvedEnctype = method === 'post' ? enctype : undefined;

  return (
    <form
      className={buildClasses(className)}
      data-pattern="timberland/form"
      name={name}
      id={id}
      acceptCharset={charset}
      action={action}
      autoComplete={autocomplete ? 'on' : 'off'}
      method={method}
      encType={resolvedEnctype}
      noValidate={noValidate}
      target={target}
    >
      {hasHeader && (
        <header>
          {heading && <h2 className="form-title">{heading}</h2>}
          {intro && <div className="form-intro">{intro}</div>}
        </header>
      )}

      {children}

      {footer && <footer>{footer}</footer>}
    </form>
  );
}
