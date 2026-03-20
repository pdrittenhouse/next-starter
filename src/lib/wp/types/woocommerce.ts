/**
 * WooCommerce types (wp-graphql-woocommerce plugin).
 */

import type { WpConnection, WpImage } from './common';

/** Product variation attribute. */
export interface WcVariationAttribute {
  id: string;
  name: string;
  value: string;
}

/** Product variation. */
export interface WcProductVariation {
  id: string;
  databaseId: number;
  name?: string;
  sku?: string;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: string;
  stockQuantity?: number;
  image?: WpImage;
  attributes?: WpConnection<WcVariationAttribute>;
}

/** Product attribute. */
export interface WcProductAttribute {
  id: string;
  name: string;
  options?: string[];
  variation?: boolean;
  visible?: boolean;
}

/** Product category. */
export interface WcProductCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  image?: WpImage;
  parent?: {
    node: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

/** Product node (covers Simple, Variable, External, Group). */
export interface WcProduct {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  type?: string;
  status?: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  dateCreated?: string;
  modified?: string;
  onSale?: boolean;
  purchasable?: boolean;
  averageRating?: number;
  reviewCount?: number;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: string;
  stockQuantity?: number;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  image?: WpImage;
  galleryImages?: WpConnection<WpImage>;
  productCategories?: WpConnection<{ id: string; name: string; slug: string }>;
  productTags?: WpConnection<{ id: string; name: string; slug: string }>;
  attributes?: WpConnection<WcProductAttribute>;
  related?: WpConnection<{ id: string; name: string; slug: string }>;
  /** Variable products only */
  variations?: WpConnection<WcProductVariation>;
  /** External products only */
  externalUrl?: string;
  buttonText?: string;
  /** Group products only */
  products?: WpConnection<{ id: string; name: string; slug: string }>;
}

/** Order billing address. */
export interface WcBillingAddress {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

/** Order shipping address. */
export interface WcShippingAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

/** Order line item. */
export interface WcLineItem {
  productId?: number;
  quantity?: number;
  total?: string;
  subtotal?: string;
  product?: {
    node: {
      id: string;
      name: string;
      slug: string;
      sku?: string;
    };
  };
}

/** Order coupon line. */
export interface WcCouponLine {
  code: string;
  discount?: string;
  discountTax?: string;
}

/** Order node. */
export interface WcOrder {
  id: string;
  databaseId: number;
  orderNumber?: string;
  status?: string;
  total?: string;
  subtotal?: string;
  totalTax?: string;
  shippingTotal?: string;
  discountTotal?: string;
  paymentMethod?: string;
  paymentMethodTitle?: string;
  currency?: string;
  date?: string;
  modified?: string;
  billing?: WcBillingAddress;
  shipping?: WcShippingAddress;
  lineItems?: WpConnection<WcLineItem>;
  couponLines?: WpConnection<WcCouponLine>;
}

/** Coupon node. */
export interface WcCoupon {
  id: string;
  databaseId: number;
  code: string;
  description?: string;
  discountType?: string;
  amount?: string;
  dateExpiry?: string;
  usageCount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  minimumAmount?: string;
  maximumAmount?: string;
  freeShipping?: boolean;
  excludeSaleItems?: boolean;
}

/** Payment gateway. */
export interface WcPaymentGateway {
  id: string;
  title?: string;
  description?: string;
  icon?: string;
}

/** Shipping method. */
export interface WcShippingMethod {
  id: string;
  title?: string;
  description?: string;
}

/** Tax rate. */
export interface WcTaxRate {
  id: string;
  country?: string;
  state?: string;
  rate?: string;
  name?: string;
  priority?: number;
  compound?: boolean;
  shipping?: boolean;
}
