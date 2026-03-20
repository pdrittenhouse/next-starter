/**
 * WordPress settings, site health, SEO, permalinks, redirects, customizer.
 */

/** General settings. */
export interface WpGeneralSettings {
  description?: string;
  dateFormat?: string;
  language?: string;
  startOfWeek?: number;
  timeFormat?: string;
  timezone?: string;
  title?: string;
  url?: string;
}

/** Reading settings. */
export interface WpReadingSettings {
  pageForPosts?: number;
  pageOnFront?: number;
  postsPerPage?: number;
  showOnFront?: string;
}

/** Writing settings. */
export interface WpWritingSettings {
  defaultCategory?: number;
  defaultPostFormat?: string;
  useSmilies?: boolean;
}

/** Discussion settings. */
export interface WpDiscussionSettings {
  defaultCommentStatus?: string;
  defaultPingStatus?: string;
}

/** All settings (flat). */
export interface WpAllSettings {
  discussionSettingsDefaultCommentStatus?: string;
  discussionSettingsDefaultPingStatus?: string;
  generalSettingsDateFormat?: string;
  generalSettingsDescription?: string;
  generalSettingsLanguage?: string;
  generalSettingsStartOfWeek?: number;
  generalSettingsTimeFormat?: string;
  generalSettingsTimezone?: string;
  generalSettingsTitle?: string;
  generalSettingsUrl?: string;
  readingSettingsPageForPosts?: number;
  readingSettingsPageOnFront?: number;
  readingSettingsPostsPerPage?: number;
  readingSettingsShowOnFront?: string;
  writingSettingsDefaultCategory?: number;
  writingSettingsDefaultPostFormat?: string;
  writingSettingsUseSmilies?: boolean;
}

/** Permalink settings (custom resolver). */
export interface WpPermalinkSettings {
  structure?: string;
  categoryBase?: string;
  tagBase?: string;
  rewriteRules?: Array<{
    pattern: string;
    query: string;
  }>;
}

/** Site health (custom resolver). */
export interface WpSiteHealth {
  wpVersion?: string;
  phpVersion?: string;
  mysqlVersion?: string;
  serverSoftware?: string;
  isMultisite?: boolean;
  siteUrl?: string;
  homeUrl?: string;
  wpDebug?: boolean;
  memoryLimit?: string;
  maxUploadSize?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  language?: string;
  isRtl?: boolean;
  activeTheme?: {
    name: string;
    version: string;
    themeUri?: string;
    textDomain?: string;
  };
}

/** Redirect rule (custom resolver). */
export interface WpRedirect {
  from: string;
  to: string;
  statusCode: number;
  matchType?: string;
}

/** Global SEO settings (custom resolver — Yoast/RankMath). */
export interface WpSeoSettings {
  plugin?: string;
  separator?: string;
  siteTitle?: string;
  siteDescription?: string;
  defaultOgImage?: string;
  socialProfiles?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedIn?: string;
    youTube?: string;
    pinterest?: string;
    mySpace?: string;
    soundCloud?: string;
    tumblr?: string;
    wikipedia?: string;
  };
  webmaster?: {
    google?: string;
    bing?: string;
    yandex?: string;
    pinterest?: string;
    baidu?: string;
    norton?: string;
  };
  schema?: {
    organizationName?: string;
    organizationLogo?: string;
    organizationType?: string;
    personName?: string;
    siteUrl?: string;
  };
  breadcrumbs?: {
    enabled?: boolean;
    separator?: string;
    homeText?: string;
    prefix?: string;
    showBlogPage?: boolean;
  };
}

/** Customizer settings (custom resolver). */
export interface WpCustomizerSettings {
  customLogo?: { id: string; sourceUrl: string; altText?: string };
  customLogoUrl?: string;
  siteIcon?: { id: string; sourceUrl: string; altText?: string };
  siteIconUrl?: string;
  headerImage?: string;
  headerImageData?: { id: string; sourceUrl: string; altText?: string };
  headerTextColor?: string;
  backgroundColor?: string;
  displayHeaderText?: boolean;
  backgroundImage?: string;
  backgroundRepeat?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundAttachment?: string;
  customCss?: string;
  menuLocations?: string[];
}
