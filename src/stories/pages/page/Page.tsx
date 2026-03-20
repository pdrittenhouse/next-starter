import React from 'react';
import { Header } from '../../organisms/header/Header';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import CardLink from 'react-bootstrap/CardLink'
import Image from "next/image";
import vercelLogo from "../../../../public/vercel.svg";
import styles from './page.module.scss';
import { useQuery } from "@apollo/client";
import {
  GET_GENERAL_SETTINGS, GET_ALL_SETTINGS, GET_DISCUSSION_SETTINGS, GET_READING_SETTINGS, GET_WRITING_SETTINGS,
  GET_ALL_POSTS, GET_ALL_PAGES, GET_ALL_CATEGORIES, GET_ALL_TAGS, GET_ALL_TAXONOMIES,
  GET_ALL_USERS, GET_ALL_MENUS, GET_SCHEMA_QUERY_FIELDS,
  GET_ALL_THEMES, GET_ALL_MEDIA_ITEMS, GET_ALL_COMMENTS,
  GET_ALL_CONTENT_TYPES, GET_ALL_CONTENT_NODES,
  GET_ALL_PLUGINS, GET_ALL_POST_FORMATS, GET_VIEWER, GET_ALL_USER_ROLES,
  GET_REGISTERED_SCRIPTS, GET_REGISTERED_STYLESHEETS, GET_THEME_ENQUEUED_ASSETS,
  GET_ALL_REVISIONS, GET_CUSTOMIZER_SETTINGS, GET_THEME_SETTINGS,
  GET_WIDGET_AREAS, GET_BLOCK_PATTERNS,
  GET_PERMALINK_SETTINGS, GET_SITE_HEALTH, GET_REDIRECTS, GET_SEO_SETTINGS,
  GET_ALL_GRAVITY_FORMS,
  GET_ALL_PRODUCTS, GET_PRODUCT_CATEGORIES, GET_ALL_ORDERS, GET_ALL_COUPONS, GET_SHOP_SETTINGS,
} from "@/lib/wp/queries";
import { THEME_OPTIONS_FIELDS, camelToLabel, taxonomyLabel } from "@/lib/wp/utils";
import { DynamicPostType } from "../../components/DynamicPostType";
import { DynamicTaxonomy } from "../../components/DynamicTaxonomy";
import { DynamicThemeOptions } from "../../components/DynamicThemeOptions";

type User = {
  name: string;
};

export const Page: React.FC = () => {
  const [user, setUser] = React.useState<User>();

  const { loading, error, data } = useQuery(GET_GENERAL_SETTINGS)
  const { loading: postsLoading, data: postsData } = useQuery(GET_ALL_POSTS)
  const { loading: pagesLoading, data: pagesData } = useQuery(GET_ALL_PAGES)
  const { loading: categoriesLoading, data: categoriesData } = useQuery(GET_ALL_CATEGORIES)
  const { loading: tagsLoading, data: tagsData } = useQuery(GET_ALL_TAGS)
  const { loading: taxonomiesLoading, data: taxonomiesData } = useQuery(GET_ALL_TAXONOMIES)
  const { loading: usersLoading, data: usersData } = useQuery(GET_ALL_USERS)
  const { loading: menusLoading, data: menusData } = useQuery(GET_ALL_MENUS)
  const { loading: schemaLoading, error: schemaError, data: schemaData } = useQuery(GET_SCHEMA_QUERY_FIELDS, { context: { useAuth: true } })
  const { loading: allSettingsLoading, data: allSettingsData } = useQuery(GET_ALL_SETTINGS)
  const { loading: discussionLoading, data: discussionData } = useQuery(GET_DISCUSSION_SETTINGS)
  const { loading: readingLoading, data: readingData } = useQuery(GET_READING_SETTINGS)
  const { loading: writingLoading, data: writingData } = useQuery(GET_WRITING_SETTINGS)
  const { loading: themesLoading, data: themesData } = useQuery(GET_ALL_THEMES)
  const { loading: mediaLoading, data: mediaData } = useQuery(GET_ALL_MEDIA_ITEMS)
  const { loading: commentsLoading, data: commentsData } = useQuery(GET_ALL_COMMENTS)
  const { loading: contentTypesLoading, data: contentTypesData } = useQuery(GET_ALL_CONTENT_TYPES)
  const { loading: contentNodesLoading, data: contentNodesData } = useQuery(GET_ALL_CONTENT_NODES)
  const { loading: pluginsLoading, data: pluginsData } = useQuery(GET_ALL_PLUGINS)
  const { loading: postFormatsLoading, data: postFormatsData } = useQuery(GET_ALL_POST_FORMATS)
  const { loading: viewerLoading, data: viewerData } = useQuery(GET_VIEWER)
  const { loading: userRolesLoading, data: userRolesData } = useQuery(GET_ALL_USER_ROLES)
  const { loading: scriptsLoading, data: scriptsData } = useQuery(GET_REGISTERED_SCRIPTS)
  const { loading: stylesLoading, data: stylesData } = useQuery(GET_REGISTERED_STYLESHEETS)
  const { loading: revisionsLoading, data: revisionsData } = useQuery(GET_ALL_REVISIONS)
  const { loading: customizerLoading, error: customizerError, data: customizerData } = useQuery(GET_CUSTOMIZER_SETTINGS)
  const { loading: themeSettingsLoading, error: themeSettingsError, data: themeSettingsData } = useQuery(GET_THEME_SETTINGS)
  const { loading: widgetAreasLoading, error: widgetAreasError, data: widgetAreasData } = useQuery(GET_WIDGET_AREAS)
  const { loading: patternsLoading, error: patternsError, data: patternsData } = useQuery(GET_BLOCK_PATTERNS)
  const { loading: themeAssetsLoading, error: themeAssetsError, data: themeAssetsData } = useQuery(GET_THEME_ENQUEUED_ASSETS)
  const { loading: permalinksLoading, error: permalinksError, data: permalinksData } = useQuery(GET_PERMALINK_SETTINGS)
  const { loading: siteHealthLoading, error: siteHealthError, data: siteHealthData } = useQuery(GET_SITE_HEALTH)
  const { loading: redirectsLoading, error: redirectsError, data: redirectsData } = useQuery(GET_REDIRECTS)
  const { loading: seoLoading, error: seoError, data: seoData } = useQuery(GET_SEO_SETTINGS)
  const { loading: gfLoading, error: gfError, data: gfData } = useQuery(GET_ALL_GRAVITY_FORMS)
  const { loading: productsLoading, error: productsError, data: productsData } = useQuery(GET_ALL_PRODUCTS)
  const { loading: productCatsLoading, error: productCatsError, data: productCatsData } = useQuery(GET_PRODUCT_CATEGORIES)
  const { loading: ordersLoading, error: ordersError, data: ordersData } = useQuery(GET_ALL_ORDERS)
  const { loading: couponsLoading, error: couponsError, data: couponsData } = useQuery(GET_ALL_COUPONS)
  const { loading: shopLoading, error: shopError, data: shopData } = useQuery(GET_SHOP_SETTINGS)

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`

  return (
    <main className={styles.main}>
      <article>
        <Header
            user={user}
            onLogin={() => setUser({ name: 'Kenneth Folk' })}
            onLogout={() => setUser(undefined)}
            onCreateAccount={() => setUser({ name: 'Kenneth Folk' })}
        />

        <section className={styles.descriptionWrapper}>
          <Container>
            <Row>
              <Col>
                <div className={styles.description}>
                  <p>
                    Get started by editing&nbsp;
                    <code className={styles.code}>src/app/page.tsx</code><br />
                    or edit components in&nbsp;
                    <code className={styles.code}>src/stories</code>
                  </p>
                  <div>
                    <a
                        href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                      By{" "}
                      <Image
                          src={vercelLogo}
                          alt="Vercel Logo"
                          className={styles.vercelLogo}
                          width={100}
                          height={24}
                          priority
                      />
                    </a>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className={styles.storybookPage}>
          <Container>
            <Row>
              <Col>
                <h2>Pages in Storybook</h2>
                <p>
                  We recommend building UIs with a{' '}
                  <a href="https://componentdriven.org" target="_blank" rel="noopener noreferrer">
                    <strong>component-driven</strong>
                  </a>{' '}
                  process based on <a href="https://atomicdesign.bradfrost.com/chapter-2/" target="_blank" rel="noopener noreferrer">atomic design principals</a> starting with atomic components [atoms, molecules, organisms] and ending with pages.
                </p>
                <p>
                  Get a guided tutorial on component-driven development at{' '}
                  <a href="https://storybook.js.org/tutorials/" target="_blank" rel="noopener noreferrer">
                    Storybook tutorials
                  </a>
                  . Read more in the{' '}
                  <a href="https://storybook.js.org/docs" target="_blank" rel="noopener noreferrer">
                    docs
                  </a>
                  .
                </p>
                <p>
                  Render pages with mock data. This makes it easy to build and review page states without
                  needing to navigate to them in your app. Here are some handy patterns for managing page
                  data in Storybook:
                </p>
                <ul>
                  <li>
                    Use a higher-level connected component. Storybook helps you compose such data from the
                    &ldquo;args&rdquo; of child component stories
                  </li>
                  <li>
                    Assemble data in the page component from your services. You can mock these services out
                    using Storybook.
                  </li>
                </ul>
                <div className={styles.dataWrapper}>
                  {data.generalSettings && (
                      <>
                        <h4>Example Data</h4>
                        <h5>
                          <a href={data.generalSettings.url}>{data.generalSettings.title}</a>
                        </h5>
                        <p>{data.generalSettings.description}</p>
                      </>
                  )}
                </div>
                <div className={styles.dataWrapper}>
                  <h5>All Query Data</h5>

                  <br />
                  <h6>Introspection</h6>
                  {schemaLoading ? <p>Loading schema...</p> : schemaError ? (
                    <p><small>Requires either a valid <code>.env.local</code> with <code>NEXT_PUBLIC_WP_AUTH_USER</code> and <code>NEXT_PUBLIC_WP_AUTH_APP_PASSWORD</code>, or &ldquo;Enable Public Introspection&rdquo; in WP Admin &gt; GraphQL &gt; Settings.</small></p>
                  ) : schemaData && (
                    <details>
                      <summary>Schema Query Fields ({schemaData.__schema?.queryType?.fields?.length ?? 0})</summary>
                      <pre>{JSON.stringify(schemaData.__schema.queryType.fields, null, 2)}</pre>
                    </details>
                  )}

                  <br />
                  <h6>Settings</h6>
                  {allSettingsLoading ? <p>Loading all settings...</p> : allSettingsData && (
                    <details>
                      <summary>All Settings</summary>
                      <pre>{JSON.stringify(allSettingsData, null, 2)}</pre>
                    </details>
                  )}
                  {data.generalSettings && (
                    <details>
                      <summary>General Settings</summary>
                      <pre>{JSON.stringify(data.generalSettings, null, 2)}</pre>
                    </details>
                  )}
                  {readingLoading ? <p>Loading reading settings...</p> : readingData && (
                    <details>
                      <summary>Reading Settings</summary>
                      <pre>{JSON.stringify(readingData, null, 2)}</pre>
                    </details>
                  )}
                  {writingLoading ? <p>Loading writing settings...</p> : writingData && (
                    <details>
                      <summary>Writing Settings</summary>
                      <pre>{JSON.stringify(writingData, null, 2)}</pre>
                    </details>
                  )}
                  {discussionLoading ? <p>Loading discussion settings...</p> : discussionData && (
                    <details>
                      <summary>Discussion Settings</summary>
                      <pre>{JSON.stringify(discussionData, null, 2)}</pre>
                    </details>
                  )}
                  {permalinksLoading ? <p>Loading permalink settings...</p> : permalinksError ? (
                    <p style={{color: 'red'}}>Permalink Settings Error: {permalinksError.message}</p>
                  ) : permalinksData && (
                    <details>
                      <summary>Permalink Settings ({permalinksData.permalinkSettings?.rewriteRules?.length ?? 0} rewrite rules)</summary>
                      <pre>{JSON.stringify(permalinksData, null, 2)}</pre>
                    </details>
                  )}
                  {siteHealthLoading ? <p>Loading site health...</p> : siteHealthError ? (
                    <p style={{color: 'red'}}>Site Health Error: {siteHealthError.message}</p>
                  ) : siteHealthData && (
                    <details>
                      <summary>Site Health</summary>
                      <pre>{JSON.stringify(siteHealthData, null, 2)}</pre>
                    </details>
                  )}
                  {redirectsLoading ? <p>Loading redirects...</p> : redirectsError ? (
                    <p style={{color: 'red'}}>Redirects Error: {redirectsError.message}</p>
                  ) : redirectsData && (
                    <details>
                      <summary>Redirects ({redirectsData.redirects?.length ?? 0})</summary>
                      <pre>{JSON.stringify(redirectsData, null, 2)}</pre>
                    </details>
                  )}
                  {seoLoading ? <p>Loading SEO settings...</p> : seoError ? (
                    <p style={{color: 'red'}}>SEO Settings Error: {seoError.message}</p>
                  ) : seoData && (
                    <details>
                      <summary>SEO Settings ({seoData.seoSettings?.plugin || 'none detected'})</summary>
                      <pre>{JSON.stringify(seoData, null, 2)}</pre>
                    </details>
                  )}
                  {customizerLoading ? <p>Loading customizer settings...</p> : customizerError ? (
                    <p style={{color: 'red'}}>Customizer Settings Error: {customizerError.message}</p>
                  ) : customizerData && (
                    <details>
                      <summary>Customizer Settings</summary>
                      <pre>{JSON.stringify(customizerData, null, 2)}</pre>
                    </details>
                  )}

                  <br />
                  <h6>Content</h6>
                  {postsLoading ? <p>Loading posts...</p> : postsData && (
                    <details>
                      <summary>Posts ({postsData.posts?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(postsData, null, 2)}</pre>
                    </details>
                  )}
                  {pagesLoading ? <p>Loading pages...</p> : pagesData && (
                    <details>
                      <summary>Pages ({pagesData.pages?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(pagesData, null, 2)}</pre>
                    </details>
                  )}
                  {commentsLoading ? <p>Loading comments...</p> : commentsData && (
                    <details>
                      <summary>Comments ({commentsData.comments?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(commentsData, null, 2)}</pre>
                    </details>
                  )}
                  {revisionsLoading ? <p>Loading revisions...</p> : revisionsData && (
                    <details>
                      <summary>Revisions ({revisionsData.revisions?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(revisionsData, null, 2)}</pre>
                    </details>
                  )}
                  {contentTypesLoading ? <p>Loading content types...</p> : contentTypesData && (
                    <details>
                      <summary>Content Types ({contentTypesData.contentTypes?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(contentTypesData, null, 2)}</pre>
                    </details>
                  )}
                  {contentNodesLoading ? <p>Loading content nodes...</p> : contentNodesData && (
                    <details>
                      <summary>Content Nodes ({contentNodesData.contentNodes?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(contentNodesData, null, 2)}</pre>
                    </details>
                  )}
                  {postFormatsLoading ? <p>Loading post formats...</p> : postFormatsData && (
                    <details>
                      <summary>Post Formats ({postFormatsData.postFormats?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(postFormatsData, null, 2)}</pre>
                    </details>
                  )}

                  <br />
                  <h6>Custom Post Types</h6>
                  {contentTypesLoading ? <p>Loading custom post types...</p> : contentTypesData && (
                    contentTypesData.contentTypes?.edges
                      ?.filter((edge: any) => !['post', 'page', 'attachment'].includes(edge.node.name))
                      .map((edge: any) => (
                        <React.Fragment key={edge.node.name}>
                          <DynamicPostType
                            pluralName={edge.node.graphqlPluralName}
                            singleName={edge.node.graphqlSingleName}
                            label={edge.node.label}
                          />
                          <DynamicPostType
                            pluralName={edge.node.graphqlPluralName}
                            singleName={edge.node.graphqlSingleName}
                            label={edge.node.label}
                            withContent
                          />
                        </React.Fragment>
                      ))
                  )}

                  <br />
                  <h6>Taxonomies</h6>
                  {taxonomiesLoading ? <p>Loading taxonomies...</p> : taxonomiesData && (
                    <details>
                      <summary>Taxonomies ({taxonomiesData.taxonomies?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(taxonomiesData, null, 2)}</pre>
                    </details>
                  )}
                  {categoriesLoading ? <p>Loading categories...</p> : categoriesData && (
                    <details>
                      <summary>Categories ({categoriesData.categories?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(categoriesData, null, 2)}</pre>
                    </details>
                  )}
                  {tagsLoading ? <p>Loading tags...</p> : tagsData && (
                    <details>
                      <summary>Tags ({tagsData.tags?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(tagsData, null, 2)}</pre>
                    </details>
                  )}
                  {taxonomiesLoading ? null : taxonomiesData && (
                    taxonomiesData.taxonomies?.edges
                      ?.filter((edge: any) => !['category', 'post_tag', 'post_format'].includes(edge.node.name))
                      .map((edge: any) => (
                        <DynamicTaxonomy
                          key={edge.node.name}
                          pluralName={edge.node.graphqlPluralName}
                          label={taxonomyLabel(edge.node.label, edge.node.name)}
                        />
                      ))
                  )}

                  <br />
                  <h6>Media</h6>
                  {mediaLoading ? <p>Loading media...</p> : mediaData && (
                    <details>
                      <summary>Media Items ({mediaData.mediaItems?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(mediaData, null, 2)}</pre>
                    </details>
                  )}

                  <br />
                  <h6>Navigation</h6>
                  {menusLoading ? <p>Loading menus...</p> : menusData && (
                    <details>
                      <summary>Menus ({menusData.menus?.nodes?.length ?? 0})</summary>
                      <pre>{JSON.stringify(menusData, null, 2)}</pre>
                    </details>
                  )}

                  <br />
                  <h6>Widgets</h6>
                  {widgetAreasLoading ? <p>Loading widget areas...</p> : widgetAreasError ? (
                    <p style={{color: 'red'}}>Widget Areas Error: {widgetAreasError.message}</p>
                  ) : widgetAreasData && (
                    <details>
                      <summary>Widget Areas ({widgetAreasData.widgetAreas?.length ?? 0})</summary>
                      <pre>{JSON.stringify(widgetAreasData, null, 2)}</pre>
                    </details>
                  )}

                  <br />
                  <h6>Patterns</h6>
                  {patternsLoading ? <p>Loading patterns...</p> : patternsError ? (
                    <p style={{color: 'red'}}>Patterns Error: {patternsError.message}</p>
                  ) : patternsData && (
                    <>
                      <details>
                        <summary>Block Patterns ({patternsData.blockPatterns?.length ?? 0})</summary>
                        <pre>{JSON.stringify(patternsData.blockPatterns, null, 2)}</pre>
                      </details>
                      <details>
                        <summary>Block Pattern Categories ({patternsData.blockPatternCategories?.length ?? 0})</summary>
                        <pre>{JSON.stringify(patternsData.blockPatternCategories, null, 2)}</pre>
                      </details>
                    </>
                  )}

                  <br />
                  <h6>Users &amp; Roles</h6>
                  {viewerLoading ? <p>Loading viewer...</p> : viewerData && (
                    <details>
                      <summary>Viewer (Current User)</summary>
                      <pre>{JSON.stringify(viewerData, null, 2)}</pre>
                    </details>
                  )}
                  {usersLoading ? <p>Loading users...</p> : usersData && (
                    <details>
                      <summary>Users ({usersData.users?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(usersData, null, 2)}</pre>
                    </details>
                  )}
                  {userRolesLoading ? <p>Loading user roles...</p> : userRolesData && (
                    <details>
                      <summary>User Roles ({userRolesData.userRoles?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(userRolesData, null, 2)}</pre>
                    </details>
                  )}

                  <br />
                  <h6>Themes &amp; Assets</h6>
                  {themesLoading ? <p>Loading themes...</p> : themesData && (
                    <details>
                      <summary>Themes ({themesData.themes?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(themesData, null, 2)}</pre>
                    </details>
                  )}
                  {pluginsLoading ? <p>Loading plugins...</p> : pluginsData && (
                    <details>
                      <summary>Plugins ({pluginsData.plugins?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(pluginsData, null, 2)}</pre>
                    </details>
                  )}
                  {scriptsLoading ? <p>Loading scripts...</p> : scriptsData && (
                    <details>
                      <summary>Registered Scripts ({scriptsData.registeredScripts?.nodes?.length ?? 0})</summary>
                      <pre>{JSON.stringify(scriptsData, null, 2)}</pre>
                    </details>
                  )}
                  {stylesLoading ? <p>Loading stylesheets...</p> : stylesData && (
                    <details>
                      <summary>Registered Stylesheets ({stylesData.registeredStylesheets?.nodes?.length ?? 0})</summary>
                      <pre>{JSON.stringify(stylesData, null, 2)}</pre>
                    </details>
                  )}
                  {themeAssetsLoading ? <p>Loading theme enqueued assets...</p> : themeAssetsError ? (
                    <p style={{color: 'red'}}>Theme Enqueued Assets Error: {themeAssetsError.message}</p>
                  ) : themeAssetsData && (
                    <>
                      <details>
                        <summary>Theme Enqueued Scripts ({themeAssetsData.themeEnqueuedScripts?.length ?? 0})</summary>
                        <pre>{JSON.stringify(themeAssetsData.themeEnqueuedScripts, null, 2)}</pre>
                      </details>
                      <details>
                        <summary>Theme Enqueued Stylesheets ({themeAssetsData.themeEnqueuedStylesheets?.length ?? 0})</summary>
                        <pre>{JSON.stringify(themeAssetsData.themeEnqueuedStylesheets, null, 2)}</pre>
                      </details>
                    </>
                  )}

                  <br />
                  <h6>Timberland</h6>
                  {themeSettingsLoading ? <p>Loading theme settings...</p> : themeSettingsError ? (
                    <p style={{color: 'red'}}>Theme Settings Error: {themeSettingsError.message}</p>
                  ) : themeSettingsData && (
                    <details>
                      <summary>Theme Settings (Customizer)</summary>
                      <pre>{JSON.stringify(themeSettingsData, null, 2)}</pre>
                    </details>
                  )}
                  {schemaLoading ? <p>Loading theme options...</p> : schemaData && (
                    schemaData.__schema?.queryType?.fields
                      ?.filter((field: any) =>
                        field.type.kind === 'OBJECT' &&
                        !field.description &&
                        (THEME_OPTIONS_FIELDS as readonly string[]).includes(field.name)
                      )
                      .map((field: any) => (
                        <DynamicThemeOptions
                          key={field.name}
                          fieldName={field.name}
                          typeName={field.type.name}
                          label={camelToLabel(field.name)}
                        />
                      ))
                  )}

                  <br />
                  <h6>Gravity Forms</h6>
                  {gfLoading ? <p>Loading gravity forms...</p> : gfError ? (
                    <p style={{color: 'red'}}>Gravity Forms Error: {gfError.message}</p>
                  ) : gfData && (
                    <details>
                      <summary>Forms ({gfData.gfForms?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(gfData, null, 2)}</pre>
                    </details>
                  )}

                  <br />
                  <h6>WooCommerce</h6>
                  {productsLoading ? <p>Loading products...</p> : productsError ? (
                    <p style={{color: 'red'}}>Products Error: {productsError.message}</p>
                  ) : productsData && (
                    <details>
                      <summary>Products ({productsData.products?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(productsData, null, 2)}</pre>
                    </details>
                  )}
                  {productCatsLoading ? <p>Loading product categories...</p> : productCatsError ? (
                    <p style={{color: 'red'}}>Product Categories Error: {productCatsError.message}</p>
                  ) : productCatsData && (
                    <details>
                      <summary>Product Categories ({productCatsData.productCategories?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(productCatsData, null, 2)}</pre>
                    </details>
                  )}
                  {ordersLoading ? <p>Loading orders...</p> : ordersError ? (
                    <p style={{color: 'red'}}>Orders Error: {ordersError.message}</p>
                  ) : ordersData && (
                    <details>
                      <summary>Orders ({ordersData.orders?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(ordersData, null, 2)}</pre>
                    </details>
                  )}
                  {couponsLoading ? <p>Loading coupons...</p> : couponsError ? (
                    <p style={{color: 'red'}}>Coupons Error: {couponsError.message}</p>
                  ) : couponsData && (
                    <details>
                      <summary>Coupons ({couponsData.coupons?.edges?.length ?? 0})</summary>
                      <pre>{JSON.stringify(couponsData, null, 2)}</pre>
                    </details>
                  )}
                  {shopLoading ? <p>Loading shop settings...</p> : shopError ? (
                    <p style={{color: 'red'}}>Shop Settings Error: {shopError.message}</p>
                  ) : shopData && (
                    <details>
                      <summary>Shop Settings</summary>
                      <pre>{JSON.stringify(shopData, null, 2)}</pre>
                    </details>
                  )}
                </div>
                <div className={styles.tipWrapper}>
                  <span className="tip">Tip</span> Adjust the width of the canvas with the{' '}
                  <svg width="10" height="10" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path
                          d="M1.5 5.2h4.8c.3 0 .5.2.5.4v5.1c-.1.2-.3.3-.4.3H1.4a.5.5 0 01-.5-.4V5.7c0-.3.2-.5.5-.5zm0-2.1h6.9c.3 0 .5.2.5.4v7a.5.5 0 01-1 0V4H1.5a.5.5 0 010-1zm0-2.1h9c.3 0 .5.2.5.4v9.1a.5.5 0 01-1 0V2H1.5a.5.5 0 010-1zm4.3 5.2H2V10h3.8V6.2z"
                          id="a"
                          fill="#999"
                      />
                    </g>
                  </svg>
                  Viewports addon in the toolbar
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className={styles.gridWrapper}>
          <Container>
            <Row xs={1} md={2} xl={4} className={`${styles.grid} g-4`}>
              <Col>
                <Card bg="dark" border="light" className={styles.gridCard}>
                  <Card.Link href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"  target="_blank">
                    <Card.Body>
                      <Card.Title className={styles.gridCardTitle}>Docs <span>-&gt;</span></Card.Title>
                      <Card.Text className={styles.gridCardText}>
                        Find in-depth information about Next.js features and API.
                      </Card.Text>
                    </Card.Body>
                  </Card.Link>
                </Card>
              </Col>
              <Col>
                <Card bg="dark" border="light" className={styles.gridCard}>
                  <Card.Link href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"  target="_blank">
                    <Card.Body>
                      <Card.Title className={styles.gridCardTitle}>Learn <span>-&gt;</span></Card.Title>
                      <Card.Text className={styles.gridCardText}>
                        Learn about Next.js in an interactive course with&nbsp;quizzes!
                      </Card.Text>
                    </Card.Body>
                  </Card.Link>
                </Card>
              </Col>
              <Col>
                <Card bg="dark" border="light" className={styles.gridCard}>
                  <Card.Link href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app" target="_blank">
                    <Card.Body>
                      <Card.Title className={styles.gridCardTitle}>Templates <span>-&gt;</span></Card.Title>
                      <Card.Text className={styles.gridCardText}>
                        Explore starter templates for Next.js.
                      </Card.Text>
                    </Card.Body>
                  </Card.Link>
                </Card>
              </Col>
              <Col>
                <Card bg="dark" border="light" className={styles.gridCard}>
                  <Card.Link href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"  target="_blank">
                    <Card.Body>
                      <Card.Title className={styles.gridCardTitle}>Deploy <span>-&gt;</span></Card.Title>
                      <Card.Text className={styles.gridCardText}>
                        Instantly deploy your Next.js site to a shareable URL with Vercel.
                      </Card.Text>
                    </Card.Body>
                  </Card.Link>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      </article>
    </main>
  );
};
