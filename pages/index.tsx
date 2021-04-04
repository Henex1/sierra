import React from "react";
import Head from "next/head";

import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from "@material-ui/core/styles";

import { mainListItems, secondaryListItems } from "../components/AppNavigation";

import styles from "../styles/Home.module.css";

const useStyles = makeStyles(() => ({
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
  }
}));

export default function Home() {
  const classes = useStyles();

  return (
    <div className={styles.container}>
      <Head>
        <title>Project Sierra</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Drawer
        variant="permanent"
        className={classes.drawer}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar />
        <List>{ mainListItems }</List>
        <Divider />
        <List>{ secondaryListItems }</List>
      </Drawer>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Project Sierra
        </h1>

        <p className={styles.description}>
          Get started by setting up your first project.
        </p>

        <div className={styles.grid}>
          <a href="/projects" className={styles.card}>
            <h3>Projects &rarr;</h3>
            <p>Access the Relevance Lab for testing and improving relevance for your projects.</p>
          </a>

          <a href="/datasources" className={styles.card}>
            <h3>Datasources &rarr;</h3>
            <p>Manage connection to your Elasticsearch and Solr clusters.</p>
          </a>

          <a href="#" className={styles.card}>
            <h3>Teams &rarr;</h3>
            <p>Get your team members access.</p>
          </a>

          <a href="#" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p>
              &nbsp;
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
