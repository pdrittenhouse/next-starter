import { Offcanvas } from '@/stories/patterns/molecules/offcanvas/Offcanvas';
import type { OffcanvasPlacement, OffcanvasBreakpoint } from '@/stories/patterns/molecules/offcanvas/Offcanvas';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './offcanvas.module.scss';
import { cx } from '@/lib/cx';

interface OffcanvasBlockData {
  id?: {
    id?: string | null;
    id_gen?: string | null;
  };
  placement?: OffcanvasPlacement | null;
  breakpoint?: {
    breakpoint?: OffcanvasBreakpoint | null;
  };
  backdrop?: boolean;
  scroll?: boolean;
  background_color?: {
    bg_color?: string | null;
    bg_theme_color?: string | null;
  };
  color?: {
    color?: string | null;
    theme_color?: string | null;
  };
  title?: string | null;
  close?: 'close' | 'white' | null;
  button_label?: string | null;
  button?: {
    style?: string | null;
    size?: string | null;
    outline?: boolean;
    background_color?: {
      bg_color?: string | null;
      bg_theme_color?: string | null;
    };
    text_color?: {
      color?: string | null;
      theme_color?: string | null;
    };
  };
}

interface OffcanvasBlockProps {
  block: EditorBlock;
}

export async function OffcanvasBlock({ block }: OffcanvasBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: OffcanvasBlockData; className?: string };
  const data: OffcanvasBlockData = attrs?.data ?? {};

  const offcanvasId = data.id?.id
    ? data.id.id
    : data.id?.id_gen
    ? `offcanvas${data.id.id_gen}`
    : undefined;

  // Concatenate inner blocks' rendered HTML for the offcanvas body content
  const rawInner = (block as unknown as Record<string, unknown>).innerBlocks;
  const innerBlocks = Array.isArray(rawInner) ? (rawInner as EditorBlock[]) : [];
  const innerHtml = innerBlocks.map((b) => b.renderedHtml ?? '').join('');

  const backgroundColor =
    data.background_color?.bg_color === 'palette'
      ? (data.background_color.bg_theme_color ?? undefined)
      : undefined;
  const textColor =
    data.color?.color === 'palette' ? (data.color.theme_color ?? undefined) : undefined;

  // Trigger button — map core style fields; ignore complex style overrides
  const bgBtnClass =
    data.button?.background_color?.bg_color === 'palette' && data.button.background_color.bg_theme_color
      ? `bg-${data.button.background_color.bg_theme_color}`
      : undefined;
  const textBtnClass =
    data.button?.text_color?.color === 'palette' && data.button.text_color.theme_color
      ? `text-${data.button.text_color.theme_color}`
      : undefined;
  const btnClassName = [bgBtnClass, textBtnClass].filter(Boolean).join(' ') || undefined;

  const buttonProps = {
    label: data.button_label ?? 'Open',
    variant: (data.button?.style && data.button.style !== 'custom' ? data.button.style : undefined) as any,
    size: data.button?.size as any,
    outline: data.button?.outline,
    className: btnClassName,
  };

  const wrapperClasses = cx(styles, 'block-offcanvas', attrs.className);

  return (
    <Offcanvas
      offcanvasId={offcanvasId}
      wrapperClasses={wrapperClasses || undefined}
      button={buttonProps}
      placement={data.placement ?? undefined}
      breakpoint={data.breakpoint?.breakpoint ?? undefined}
      backdrop={data.backdrop ?? true}
      scroll={data.scroll ?? false}
      backgroundColor={backgroundColor}
      textColor={textColor}
      title={data.title ?? undefined}
      closeButton={data.close ?? undefined}
      content={innerHtml ? <div dangerouslySetInnerHTML={{ __html: innerHtml }} /> : undefined}
    />
  );
}
