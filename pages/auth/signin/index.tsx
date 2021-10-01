import React, { useEffect, MouseEventHandler } from "react";
import Head from "next/head";
import { signIn } from "next-auth/client";
import { useSession } from "../../../components/Session";
import { Button, Link, Box, Grid } from "@material-ui/core";
import LoginImage from "../../../components/login/LoginImage";

type AuthTargetProps = {
  title: string;
  icon: string;
  action: MouseEventHandler;
};

const getGreeting = () => {
  const hours = new Date().getHours();
  let txt = "Good ";

  if (hours >= 0 && hours <= 13) {
    txt += "morning";
  } else if (hours > 13 && hours <= 17) {
    txt += "afternoon";
  } else if (hours > 17 && hours <= 23) {
    txt += "evening";
  }
  return txt;
};
const getCallbackURL = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  if (params.callbackUrl) {
    return params.callbackUrl;
  }
  return window.location.origin;
};

const SignInButton = (item: AuthTargetProps) => {
  return (
    <Grid item xs={12} key={item.title}>
      <Button fullWidth variant="contained" onClick={item.action}>
        <span className="btn-txt">
          <i className={`fab fa-${item.icon}`}></i>
          {item.title}
        </span>
      </Button>
    </Grid>
  );
};

export default function SignInPage() {
  const session = useSession();
  const signInWithMicrosoft = () => {
    /* add Microsoft signIn */
  };
  const signInWithAzure = () => {
    /* add Azure signIn */
  };
  const signInWithGSuite = () => {
    const url = getCallbackURL();
    signIn("google", { callbackUrl: url });
  };
  const signInWithGithub = () => {
    /* add Github signIn */
  };
  const signInWithBitbucket = () => {
    /* add Bitbucket signIn */
  };
  const socialAuthTargets = [
    { title: "Microsoft", icon: "microsoft", action: signInWithMicrosoft },
    { title: "Azure", icon: "microsoft", action: signInWithAzure },
    { title: "GSuite", icon: "google", action: signInWithGSuite },
    { title: "Github", icon: "github", action: signInWithGithub },
    { title: "Bitbucket", icon: "bitbucket", action: signInWithBitbucket },
  ];

  useEffect(() => {
    // if user already logged in and manualy type "auth/signin" in browser url it should be redirected from signin to previous page
    if (session.session.user) {
      history.back();
    }
  }, []);

  if (session.session.user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Sierra</title>
        <meta charSet="utf-8" />
        <meta
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          name="viewport"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </Head>
      <div className="login-wrapper">
        <div className="login-form-container">
          <div className="login-form">
            <img
              className="logo"
              src="../images/sierra-login-logo.svg"
              alt="Sierra Logo"
            />
            <div style={{ width: "100%" }}>
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <p className="greeting">
                      <b>{getGreeting()}</b>,<span> Welcome back!</span>
                    </p>
                  </Grid>
                  <Grid item xs={12} className="social-auth-btns">
                    <p>Sign In with</p>
                    {socialAuthTargets.map((item) => {
                      return SignInButton(item);
                    })}
                    <div className="signup-div">
                      <p>
                        Do not have an account?
                        <Link href="/auth/signup">&nbsp;Sign up</Link>
                      </p>
                    </div>
                    <div className="back-to-website-div">
                      <Link href="https://sierra.dev">
                        <i className="fas fa-long-arrow-alt-left"></i>
                        Return to website
                      </Link>
                    </div>
                  </Grid>
                </Grid>
              </Box>
            </div>
          </div>
        </div>
        <LoginImage isSignin={true} />
      </div>
    </>
  );
}
