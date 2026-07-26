import { headers } from 'next/headers';
import { SocialNav } from '@/stories/organisms/social-nav/SocialNav';
import type { SocialNavItem } from '@/stories/organisms/social-nav/SocialNav';
import { parseBlockAttributes } from '@/types/blocks';
import type { EditorBlock } from '@/types/blocks';
import styles from './social-share.module.scss';

type SocialService = 'facebook' | 'twitter' | 'linkedin' | 'reddit' | 'email' | 'copy';

interface SocialShareItemData {
  service?: SocialService | null;
  label?: string | null;
  icon?: string | null;
  color?: {
    color?: string | null;
    theme_color?: string | null;
    custom_color?: string | null;
  };
}

interface SocialShareBlockData {
  items?: SocialShareItemData[];
  direction?: 'horizontal' | 'vertical' | null;
  icon_position?: 'before' | 'after' | null;
  icon_size?: string | null;
  hide_labels?: boolean;
  hide_icons?: boolean;
  alignment?: {
    text_align?: string | null;
  };
  id?: {
    id?: string | null;
    id_gen?: string | null;
  };
}

interface SocialShareBlockProps {
  block: EditorBlock;
}

const DEFAULT_ICONS: Record<SocialService, string> = {
  facebook: 'fab fa-facebook-f',
  twitter: 'fab fa-twitter',
  linkedin: 'fab fa-linkedin-in',
  reddit: 'fab fa-reddit-alien',
  email: 'fas fa-envelope',
  copy: 'fas fa-link',
};

const DEFAULT_LABELS: Record<SocialService, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
  email: 'Email',
  copy: 'Copy URL',
};

function buildShareUrl(service: SocialService, pageUrl: string, pageTitle: string): string {
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(pageTitle);
  switch (service) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&t=${encodedTitle}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=%20${encodedTitle}:%20${encodedUrl}`;
    case 'linkedin':
      return `http://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
    case 'reddit':
      return `http://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
    case 'email':
      return `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
    case 'copy':
      return pageUrl;
  }
}

export async function SocialShareBlock({ block }: SocialShareBlockProps) {
  const attrs = parseBlockAttributes(block) as { data?: SocialShareBlockData; className?: string };
  const data: SocialShareBlockData = attrs?.data ?? {};

  if (!data.items?.length) {
    if (!block.renderedHtml) return null;
    return <div dangerouslySetInnerHTML={{ __html: block.renderedHtml }} />;
  }

  // Resolve page URL from request headers for share URL construction
  const h = await headers();
  const host = h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const pathname = h.get('x-pathname') ?? h.get('x-invoke-path') ?? '';
  const pageUrl = host ? `${proto}://${host}${pathname}` : '';
  const pageTitle = h.get('x-page-title') ?? '';

  const navItems: SocialNavItem[] = data.items.map((item, i) => {
    const service = item.service ?? 'facebook';
    const label = item.label ?? DEFAULT_LABELS[service] ?? service;
    const icon = item.icon ?? DEFAULT_ICONS[service] ?? undefined;
    const iconColor =
      item.color?.color === 'palette' ? (item.color.theme_color ?? undefined) : undefined;
    const serviceClass = `service-${service}`;

    return {
      url: pageUrl ? buildShareUrl(service, pageUrl, pageTitle) : '#',
      label,
      title: service === 'email' || service === 'copy' ? label : `Share on ${label}`,
      target: service !== 'email' && service !== 'copy' ? '_blank' : undefined,
      icon,
      iconColor,
      iconPosition: data.icon_position ?? 'before',
      itemClasses: [label.toLowerCase().replace(/\s+/g, '-'), serviceClass],
    };
  });

  const navId = data.id?.id
    ? data.id.id
    : data.id?.id_gen
    ? `social-share-${data.id.id_gen}`
    : undefined;

  const alignClass =
    data.alignment?.text_align === 'left'
      ? 'justify-content-start'
      : data.alignment?.text_align === 'right'
      ? 'justify-content-end'
      : data.alignment?.text_align === 'center'
      ? 'justify-content-center'
      : data.alignment?.text_align === 'justify'
      ? 'justify-content-between'
      : undefined;

  const blockClasses = ['block-social-share', attrs.className].filter(Boolean).join(' ');

  return (
    <div className={blockClasses || undefined}>
      <SocialNav
        navId={navId}
        items={navItems}
        navDirection={data.direction ?? 'horizontal'}
        bulletIconPosition={data.icon_position ?? 'before'}
        bulletIconSize={data.icon_size ? `${data.icon_size}px` : undefined}
        hideLabels={data.hide_labels}
        hideIcons={data.hide_icons}
        customColors={true}
        navClasses={['block-social-share--list', alignClass].filter(Boolean) as string[]}
      />
    </div>
  );
}
