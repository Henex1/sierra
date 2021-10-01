import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  CssBaseline,
  makeStyles,
} from "@material-ui/core";

import Link from "./common/Link";
import AppTopBar from "./AppTopBar/AppTopBar";
import { useSession } from "../components/Session";
import SignInPage from "../pages/auth/signin";
import SignUpPage from "../pages/auth/signup";

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

export const LayoutContext = React.createContext({
  sidebarRef: React.createRef<HTMLDivElement | null>(),
});

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
}));

type AppLayoutProps = {
  children?: React.ReactNode;
};

type LoginPageTypes = {
  [key: string]: JSX.Element;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const classes = useStyles();
  const session = useSession();
  const sidebarRef = React.useRef<HTMLDivElement | null>(null);
  const [loginPage, setLoginPage] = useState("");

  const loginPages: LoginPageTypes = {
    signin: <SignInPage />,
    signup: <SignUpPage />,
  };

  useEffect(() => {
    const { pathname } = window.location;
    if (pathname.indexOf("signup") > 1) {
      setLoginPage("signup");
    } else if (pathname.indexOf("signin") > 1) {
      setLoginPage("signin");
    }
  }, []);

  if (!session.session.user) {
    return loginPages[loginPage] || null;
  }

  return (
    <LayoutContext.Provider value={{ sidebarRef }}>
      <div className={classes.root}>
        <CssBaseline />
        <AppTopBar />
        <main className={classes.main}>
          <div className={classes.appBarSpacer} />
          <div className={classes.content}>
            <div ref={sidebarRef}></div>
            <Container maxWidth="lg" className={classes.container}>
              {children}
              <Box py={4}>
                <Copyright />
              </Box>
            </Container>
          </div>
        </main>
      </div>
    </LayoutContext.Provider>
  );
}
