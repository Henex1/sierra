import React from "react";
import { useRouter } from "next/router";

import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from "@material-ui/core/Box";

import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Toolbar from "@material-ui/core/Toolbar";
import Divider from "@material-ui/core/Divider";

import Link from "./common/Link";
import AppTopBar from "./AppTopBar/AppTopBar";
import { mainListItems, secondaryListItems } from "./AppNavigation";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://bigdataboutique.com/">
        BigData Boutique
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBarSpacer: theme.mixins.toolbar,
  main: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    flexGrow: 1,
    minHeight: "100vh",
  },
  content: {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    height: "100%",
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
  },
}));

type AppLayoutProps = {
  children?: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const classes = useStyles();
  const router = useRouter();

  // array of pages/pathname which includes navigation drawer
  const showDrawer = ["/"].includes(router.pathname);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppTopBar />
      <main className={classes.main}>
        <div className={classes.appBarSpacer} />
        <div className={classes.content}>
          {showDrawer && (
            <Drawer
              variant="permanent"
              className={classes.drawer}
              classes={{
                paper: classes.drawerPaper,
              }}
              anchor="left"
            >
              <Toolbar />
              <List>{mainListItems}</List>
              <Divider />
              <List>{secondaryListItems}</List>
            </Drawer>
          )}
          <Container maxWidth="lg" className={classes.container}>
            {children}
            <Box pt={4}>
              <Copyright />
            </Box>
          </Container>
        </div>
      </main>
    </div>
  );
}
