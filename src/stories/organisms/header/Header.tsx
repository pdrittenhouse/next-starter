import React from 'react';
import { Button } from '../../atoms/button/Button';
import Image from "next/image";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styles from './header.module.scss';
import logo from "../../../../public/next.svg";

type User = {
  name: string;
};

interface HeaderProps {
  user?: User;
  onLogin: () => void;
  onLogout: () => void;
  onCreateAccount: () => void;
}

export const Header = ({ user, onLogin, onLogout, onCreateAccount }: HeaderProps) => (
  <header>
    <Container>
      <Row>
        <Col>
          <div className={styles.storybookHeader}>
            <div className={styles.logoWrapper}>
              <Image
                  className={styles.logo}
                  src={logo}
                  alt="Next.js Logo"
                  width={180}
                  height={37}
                  priority
              />
              <h1>Next.js</h1>
            </div>
            <div>
              {user ? (
                  <>
            <span className={styles.welcome}>
              Welcome, <b>{user.name}</b>!
            </span>
                    <Button variant="secondary" size="small" onClick={onLogout} label="Log out" />
                  </>
              ) : (
                  <>
                    <Button variant="tertiary" size="small" onClick={onLogin} label="Log in" />
                    <Button variant="primary" size="small" onClick={onCreateAccount} label="Sign up" />
                  </>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  </header>
);
