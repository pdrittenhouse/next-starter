import React from 'react';
import { SvgIcon } from '@/stories/patterns/atoms/svg/SvgIcon';
import type { ButtonIconData } from '@/lib/wp/utils/resolveButtonIcon';

/**
 * One button icon — mirrors the `{% block left %}` / `{% block right %}` overrides that the
 * framework's templates supply to `_button.tpl.twig` (H5).
 *
 * Only `custom` and `font-awesome` render, because that is what the Twig reference does. The
 * ACF icon module also offers `phosphor` and `bootstrap-icons`, and the Twig templates ignore
 * both — so an editor choosing one gets nothing on either side. Matching that is deliberate:
 * the point of these components is parity with the WordPress output, and quietly rendering an
 * icon here that WordPress does not would be a worse defect than the shared gap. The gap is
 * flagged rather than fixed on one side.
 *
 * ── One intentional divergence ───────────────────────────────────────────────────────────
 * The Twig builds `transform: translate(<vertical>, <horizontal>)` — vertical into X and
 * horizontal into Y, i.e. the axes are swapped. That is a bug in the template, not a
 * convention: `translate()` takes x then y, and this repo's own `SvgMenuIcon` already does it
 * correctly. So this renders `translate(<horizontal>, <vertical>)`. Output differs from
 * WordPress only for a button that actually sets an offset, and the framework template should
 * be fixed rather than this matched to it.
 */
export interface ButtonIconProps {
  data: ButtonIconData;
  /** Which side, used only for the test id / debugging. */
  side?: 'left' | 'right';
}

/** `12` -> `12px`; an authored string (`1.5rem`) passes through. */
function px(v: number | string | null | undefined): string | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  return typeof v === 'number' || /^\d+$/.test(String(v)) ? `${v}px` : String(v);
}

export function ButtonIcon({ data }: ButtonIconProps) {
  if (!data) return null;

  const h = px(data.horizontalOffset) ?? '0px';
  const v = px(data.verticalOffset) ?? '0px';
  const hasOffset = h !== '0px' || v !== '0px';
  const transform = hasOffset ? `translate(${h}, ${v})` : undefined;
  const size = px(data.size);

  if (data.type === 'custom' && data.icon) {
    return (
      <SvgIcon
        name={data.icon}
        className="icon"
        width={size}
        height={size}
        style={{
          ...(data.color ? { color: data.color } : {}),
          ...(transform ? { transform } : {}),
        }}
      />
    );
  }

  if (data.type === 'font-awesome' && data.faIcon) {
    const style: React.CSSProperties = {
      ...(data.color ? { color: data.color } : {}),
      ...(size ? { fontSize: size } : {}),
      ...(transform ? { transform } : {}),
    };
    return (
      <span className="icon">
        <i
          className={[data.faIconStyle, data.faIcon].filter(Boolean).join(' ')}
          style={Object.keys(style).length ? style : undefined}
        />
      </span>
    );
  }

  return null;
}
