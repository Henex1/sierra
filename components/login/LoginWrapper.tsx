import React from "react";
import Head from "next/head";
import LoginImage from "./LoginImage";

type LoginWrapperProps = {
  children: React.ReactNode;
  isSignin?: boolean;
};

export default function LoginWrapper({
  children,
  isSignin = false,
}: LoginWrapperProps) {
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
            {children}
          </div>
        </div>
        <LoginImage isSignin={isSignin} />
      </div>
    </>
  );
}
