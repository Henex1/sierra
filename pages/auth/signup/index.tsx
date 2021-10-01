import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useSession } from "../../../components/Session";
import LoginImage from "../../../components/login/LoginImage";
import { Button, TextField, Link, Box, Grid } from "@material-ui/core";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const session = useSession();

  const onSubmitForm = (e: any) => {
    e.preventDefault();
    console.log(
      `firstName: ${firstName}; lastName: ${lastName}; email: ${email}; psw: ${password}`
    );
  };

  useEffect(() => {
    // if user already logged in and manualy type "auth/signup" in browser url it should be redirected from signin to previous page
    if (session.session.user) {
      history.back();
    }
  }, []);

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
            <div>
              <Box component="form" onSubmit={onSubmitForm}>
                <Grid container spacing={2}>
                  <Grid item xs={12} className="sign-up-title">
                    <p>Sign Up</p>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                      value={firstName}
                      autoComplete="fname"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                      value={lastName}
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="lname"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      value={email}
                      type="email"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      value={password}
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                    />
                  </Grid>
                </Grid>
                <Button type="submit" fullWidth variant="contained">
                  Sign Up
                </Button>
                <Grid container justify="center" className="signup-div">
                  <Grid item>
                    <p>
                      Already have an account?
                      <Link href="/auth/signin" variant="body2">
                        &nbsp;Sign in
                      </Link>
                    </p>
                  </Grid>
                </Grid>
              </Box>
            </div>
          </div>
        </div>
        <LoginImage isSignin={false} />
      </div>
    </>
  );
}
