import React, { useEffect, MouseEventHandler } from "react";
import { signIn } from "next-auth/client";
import { useSession } from "../../../components/Session";
import { Button, Link, Box, Grid } from "@material-ui/core";
import LoginWrapper from "../../../components/login/LoginWrapper";

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
    <LoginWrapper isSignin>
      <div className="signin-container">
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
    </LoginWrapper>
  );
}
