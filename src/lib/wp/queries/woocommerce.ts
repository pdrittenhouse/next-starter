import {gql} from "@apollo/client";

export const GET_ALL_PRODUCTS = gql`
    query GetAllProducts {
      products(first: 100) {
        edges {
          node {
            id
            databaseId
            name
            slug
            type
            status
            description
            shortDescription
            sku
            dateCreated
            modified
            onSale
            purchasable
            averageRating
            reviewCount
            image {
              id
              sourceUrl
              altText
            }
            galleryImages {
              edges {
                node {
                  id
                  sourceUrl
                  altText
                }
              }
            }
            productCategories {
              edges {
                node {
                  id
                  name
                  slug
                }
              }
            }
            productTags {
              edges {
                node {
                  id
                  name
                  slug
                }
              }
            }
            ... on SimpleProduct {
              price
              regularPrice
              salePrice
              stockStatus
              stockQuantity
              weight
              length
              width
              height
            }
            ... on VariableProduct {
              price
              regularPrice
              salePrice
              stockStatus
              stockQuantity
              weight
              length
              width
              height
              variations(first: 100) {
                edges {
                  node {
                    id
                    databaseId
                    name
                    sku
                    price
                    regularPrice
                    salePrice
                    stockStatus
                    stockQuantity
                    image {
                      id
                      sourceUrl
                      altText
                    }
                    attributes {
                      edges {
                        node {
                          id
                          name
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
            ... on ExternalProduct {
              price
              regularPrice
              salePrice
              externalUrl
              buttonText
            }
            ... on GroupProduct {
              products {
                edges {
                  node {
                    id
                    name
                    slug
                  }
                }
              }
            }
            attributes {
              edges {
                node {
                  id
                  name
                  options
                  variation
                  visible
                }
              }
            }
            related(first: 5) {
              edges {
                node {
                  id
                  name
                  slug
                }
              }
            }
          }
        }
      }
    }
`;

export const GET_PRODUCT_CATEGORIES = gql`
    query GetProductCategories {
      productCategories(first: 100) {
        edges {
          node {
            id
            databaseId
            name
            slug
            description
            count
            image {
              id
              sourceUrl
              altText
            }
            parent {
              node {
                id
                name
                slug
              }
            }
          }
        }
      }
    }
`;

export const GET_ALL_ORDERS = gql`
    query GetAllOrders {
      orders(first: 100) {
        edges {
          node {
            id
            databaseId
            orderNumber
            status
            total
            subtotal
            totalTax
            shippingTotal
            discountTotal
            paymentMethod
            paymentMethodTitle
            currency
            date
            modified
            billing {
              firstName
              lastName
              email
              phone
              address1
              address2
              city
              state
              postcode
              country
            }
            shipping {
              firstName
              lastName
              address1
              address2
              city
              state
              postcode
              country
            }
            lineItems {
              edges {
                node {
                  productId
                  quantity
                  total
                  subtotal
                  product {
                    node {
                      id
                      name
                      slug
                      sku
                    }
                  }
                }
              }
            }
            couponLines {
              edges {
                node {
                  code
                  discount
                  discountTax
                }
              }
            }
          }
        }
      }
    }
`;

export const GET_ALL_COUPONS = gql`
    query GetAllCoupons {
      coupons(first: 100) {
        edges {
          node {
            id
            databaseId
            code
            description
            discountType
            amount
            dateExpiry
            usageCount
            usageLimit
            usageLimitPerUser
            minimumAmount
            maximumAmount
            freeShipping
            excludeSaleItems
          }
        }
      }
    }
`;

export const GET_SHOP_SETTINGS = gql`
    query GetShopSettings {
      paymentGateways {
        edges {
          node {
            id
            title
            description
            icon
          }
        }
      }
      shippingMethods {
        edges {
          node {
            id
            title
            description
          }
        }
      }
      taxRates {
        edges {
          node {
            id
            country
            state
            rate
            name
            priority
            compound
            shipping
          }
        }
      }
    }
`;

export default GET_ALL_PRODUCTS;
