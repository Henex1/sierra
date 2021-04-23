import * as React from "react";
import Head from "next/head";
import { AppProps } from "next/app";

import { ThemeProvider } from "@material-ui/core/styles";
import { CacheProvider } from "@emotion/react";
import {
  Provider as NextSessionProvider,
  useSession,
  signIn,
} from "next-auth/client";
import CssBaseline from "@material-ui/core/CssBaseline";
import createCache from "@emotion/cache";

import theme from "../lib/theme";
import AppLayout from "../components/AppLayout";
import { SessionProvider, ActiveProjectProvider } from "../components/Session";

import "../styles/globals.css";

export const cache = createCache({ key: "css", prepend: true });

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  const [session] = useSession();

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement!.removeChild(jssStyles);
    }
  }, []);

  if (session === null) {
    signIn();
  }

  let page = (
    <>
      <Head>
        <title>Project Sierra</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <CssBaseline />
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </>
  );
  page = <ThemeProvider theme={theme} children={page} />;
  page = <CacheProvider value={cache} children={page} />;
  page = <ActiveProjectProvider children={page} />;
  page = <SessionProvider children={page} />;
  page = <NextSessionProvider children={page} session={pageProps.session} />;
  return page;
}
