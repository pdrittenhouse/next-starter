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
import { useQuery, gql } from "@apollo/client";
import { GET_GENERAL_SETTINGS } from "../../data/queries/settings";

type User = {
  name: string;
};

export const Page: React.FC = () => {
  const [user, setUser] = React.useState<User>();

  const { loading, error, data } = useQuery(GET_GENERAL_SETTINGS)

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
                    "args" of child component stories
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
