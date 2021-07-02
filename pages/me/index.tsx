import * as React from "react";

import Typography from "@material-ui/core/Typography";
import { Card, CardContent, Grid, makeStyles } from "@material-ui/core";

import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";
import UserProfileAvatar, { UserInfo } from "components/profile/UserAvatar";
import ApiKeys from "components/profile/ApiKeys";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "components/Session";
import { authenticatedPage } from "../../lib/pageHelpers";
import {
  ExposedApiKey,
  formatApiKey,
  listApiKeys,
} from "../../lib/users/apikey";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  avatarWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  profileSection: {
    display: "flex",
    justifyContent: "center",
  },
  cardRoot: {
    maxWidth: theme.spacing(80),
    width: "100%",
  },
}));

export const getServerSideProps = authenticatedPage(async (context) => {
  const apikeys = (await listApiKeys(context.user)).map(formatApiKey);
  return { props: { apikeys } };
});

type Props = {
  apikeys: ExposedApiKey[];
};

export default function Profile({ apikeys }: Props) {
  const classes = useStyles();

  const { session } = useSession();

  const [userInfo, setUserInfo] = useState<UserInfo>({
    avatar: "",
    name: "",
    email: "",
  });

  const [updating, setUpdating] = useState(false);

  const handleAvatarUpdated = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setUpdating(true);
    setTimeout(() => {
      setUserInfo((info: UserInfo) => ({
        ...info,
        avatar: url,
      }));
      setUpdating(false);
    }, 2000);
  }, []);

  useEffect(() => {
    if (session.user) {
      const userInfo: UserInfo = {
        avatar: session.user.image || "",
        name: session.user.name || "",
        email: session.user.email || "",
      };
      setUserInfo(userInfo);
    }
  }, [session.user]);

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Profile</Typography>
      </BreadcrumbsButtons>
      {/* avatar section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Profile</Typography>
        </Grid>
        <Grid item xs={12} className={classes.profileSection}>
          <Card className={classes.cardRoot}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4} className={classes.avatarWrapper}>
                  <UserProfileAvatar
                    userInfo={userInfo}
                    onAvatarUpdated={handleAvatarUpdated}
                    updating={updating}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {userInfo.name}
                  </Typography>
                  <Typography component="h6">{userInfo.email}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} className={classes.profileSection}>
          <Card className={classes.cardRoot}>
            <CardContent>
              <ApiKeys list={apikeys} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
