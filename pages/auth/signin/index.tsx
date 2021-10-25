import React, { useEffect } from "react";
import { signIn } from "next-auth/client";
import { useSession } from "../../../components/Session";
import { Button, Link, Box, Grid } from "@material-ui/core";
import LoginWrapper from "../../../components/login/LoginWrapper";
import { isAuthTypeEnabled } from "../../../lib/authSources";

type AuthTargetProps = {
  title: string;
  icon: string;
  name: string;
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

const SignInButton = ({ name, icon, title }: AuthTargetProps) => {
  const handleClick = () => {
    const url = getCallbackURL();
    signIn(name, { callbackUrl: url });
  };

  if (!isAuthTypeEnabled(name)) return null;

  return (
    <Grid item xs={12} key={title}>
      <Button fullWidth variant="contained" onClick={handleClick}>
        <span className="btn-txt">
          <i className={`fab fa-${icon}`}></i>
          {title}
        </span>
      </Button>
    </Grid>
  );
};

export default function SignInPage() {
  const session = useSession();

  const socialAuthTargets = [
    {
      title: "Atlassian",
      icon: "atlassian",
      name: "atlassian",
    },
    { title: "Azure", icon: "microsoft", name: "azureb2c" },
    { title: "GSuite", icon: "google", name: "google" },
    { title: "GitHub", icon: "github", name: "github" },
    { title: "GitLab", icon: "gitlab", name: "gitlab" },
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
              {socialAuthTargets.map((item) => (
                <SignInButton {...item} key={item.name} />
              ))}
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
