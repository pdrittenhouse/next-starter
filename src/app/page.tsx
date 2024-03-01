"use client";
import Image from "next/image";
import styles from "./page.module.scss";
import { useQuery } from "@apollo/client";
import {GET_SITE_DATA} from '@/data/site';
import { Page } from '@/stories/pages/page/Page';

export default function Home() {

  const { loading, error, data } = useQuery(GET_SITE_DATA)

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`

  return (
    <>
      <Page>
        {data.generalSettings && (
            <>
              {console.log(data.generalSettings)}
              <h1>Endpoint</h1>
              <h4>
                <a href={data.generalSettings.url}>{data.generalSettings.title}</a>
              </h4>
              <p>{data.generalSettings.description}</p>
            </>
        )}
      </Page>
    </>
  );
}
