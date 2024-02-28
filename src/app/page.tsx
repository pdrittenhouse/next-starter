"use client";
import Image from "next/image";
import styles from "./page.module.scss";
import { useQuery } from "@apollo/client";
import GET_TOASTERS from '../utils/queries';
import { Page } from '../stories/pages/page/Page';

export default function Home() {

  const { loading, error, data } = useQuery(GET_TOASTERS)

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`

  return (
    <main className={styles.main}>

      {console.log(data)}
      {data.toasters.edges.map((toaster, key) => (
          <div key={key}>
            <h2>{toaster.node.title}</h2>
          </div>
      ))}

      <Page></Page>
    </main>
  );
}
