import React, { useEffect } from "react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { getProviders } from "next-auth/client";
import Cookies from "js-cookie";

import { Box, Grid, makeStyles } from "@material-ui/core";

import {
  ExposedInvitation,
  formatInvitation,
  getInvitation,
} from "../../lib/invitation";
import { randomImage } from "../../lib/loginImage";
import LoginWrapper from "../../components/login/LoginWrapper";
import { useSession } from "../../components/Session";
import { allProviders, getGreeting, Provider, SignInButton } from "./signin";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const invitation = await getInvitation(
    context.params!.invitationId as string,
    { expiresAt: { gt: new Date(Date.now()) } }
  );
  const providersFromAuth = await getProviders();
  const providers = providersFromAuth
    ? allProviders.filter((provider) =>
        Object.keys(providersFromAuth).includes(provider.name)
      )
    : [];
  const images = await randomImage();

  return {
    props: {
      invitation: invitation ? formatInvitation(invitation) : null,
      providers,
      images,
    },
  };
};

const useStyles = makeStyles(() => ({
  invalidInvitationRoot: {
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export interface Props {
  invitation: ExposedInvitation | null;
  providers: Array<Provider>;
  images: Array<{
    src: string;
    width: number;
    height: number;
  }>;
}

export default function InvitationSignup({
  invitation,
  providers,
  images,
}: Props) {
  const classes = useStyles();
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.session.user) {
      router.replace("/");
    }
    Cookies.set("invitationId", router.query.invitationId as string);

    return () => Cookies.remove("invitationId");
  }, []);

  if (session.session.user) return null;

  if (!invitation)
    return (
      <div className={classes.invalidInvitationRoot}>
        Invalid invitation link
      </div>
    );

  return (
    <LoginWrapper images={images}>
      <div className="signin-container">
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <p className="greeting">
                <b>{getGreeting()}</b>,<span> Welcome!</span>
              </p>
            </Grid>
            <Grid item xs={12} className="social-auth-btns">
              <p>Sign In with</p>
              {providers.map((item) => (
                <SignInButton
                  {...item}
                  key={item.name}
                  authorizationParams={{ login_hint: invitation.email }}
                  callbackUrl={
                    typeof window === "undefined"
                      ? undefined
                      : window.location.href
                  }
                />
              ))}
            </Grid>
          </Grid>
        </Box>
      </div>
    </LoginWrapper>
  );
}
