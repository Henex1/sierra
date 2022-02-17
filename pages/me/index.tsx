import React, { useCallback, useEffect, useState } from "react";

import router from "next/router";
import Typography from "@material-ui/core/Typography";
import { green } from "@material-ui/core/colors";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  makeStyles,
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import UsersIcon from "@material-ui/icons/SupervisedUserCircle";
import SettingsIcon from "@material-ui/icons/SettingsApplications";

import Link, { LinkButton } from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";
import { Avatar as OrgAvatar } from "../../components/organization/Avatar";
import UserProfileAvatar, { UserInfo } from "components/profile/UserAvatar";
import { useActiveOrg, useSession } from "components/Session";
import {
  listOrgs,
  formatOrg,
  canCreateOrg,
  ExposedOrg,
  getOrgAggregates,
} from "lib/org";
import { authenticatedPage } from "lib/pageHelpers";
import CreateButton from "./organization/create/CreateButton";
import { getCookies } from "lib/cookies";
import { OrgAggregates } from "lib/org/types/OrgAggregates";

export const getServerSideProps = authenticatedPage(async (context) => {
  const { activeOrgId } = getCookies(context.req as any);

  const activeOrgStats = await getOrgAggregates(context.user, activeOrgId);
  const orgs = await listOrgs(context.user);

  return {
    props: {
      orgs: orgs.map(formatOrg),
      canCreate: canCreateOrg(context.user),
      activeOrgStats: activeOrgStats,
    },
  };
});

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
    alignItems: "flex-start",
    columnGap: 10,
  },
  cardRoot: {
    maxWidth: theme.spacing(80),
    width: "100%",
  },
  orgHeader: {
    padding: "20px 0px",
  },
  cardWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "unset",
    padding: 15,
  },
  media: {
    objectFit: "contain",
  },
  cardActions: {
    display: "flex",
    justifyContent: "space-between",
  },
  chip: {
    color: "white",
    backgroundColor: green[700],
  },
  buttonsCont: {
    display: "flex",
    flexDirection: "column",
    rowGap: "15px",
  },
  dFlex: {
    display: "flex",
    columnGap: 10,
  },
}));

type Props = {
  orgs: ExposedOrg[];
  canCreate: boolean;
  activeOrgStats: OrgAggregates;
};

export default function Profile({ orgs, canCreate, activeOrgStats }: Props) {
  const classes = useStyles();

  const { session } = useSession();
  const { activeOrg, setActiveOrg } = useActiveOrg();

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

  const createButton = canCreate ? <CreateButton /> : null;

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
          <LinkButton
            variant="outlined"
            startIcon={<EditIcon />}
            size="medium"
            href={`me`}
          >
            Edit details
          </LinkButton>
        </Grid>
        <Grid>
          <Grid>
            <Typography className={classes.orgHeader} variant="h4">
              Currently Active Organization:
            </Typography>
          </Grid>
          <Grid className={classes.dFlex}>
            <Card className={classes.cardWrapper}>
              <Grid className={classes.dFlex}>
                {activeOrg && (
                  <Grid item style={{ display: "flex", alignItems: "center" }}>
                    <OrgAvatar
                      name={activeOrg.name}
                      image={activeOrg.image ?? undefined}
                      size={"medium"}
                      square={false}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="overline">Name</Typography>
                  <Typography variant="h5">{activeOrg?.name}</Typography>
                  <Typography variant="h5">
                    {activeOrgStats?.usersCount} members
                  </Typography>
                  <Typography variant="h5">
                    {activeOrgStats?.projectsCount} projects
                  </Typography>
                  <Typography variant="h5">
                    Last execution: {activeOrgStats?.lastExecution}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
            <Grid item>
              {activeOrg?.orgType !== "USER_SPACE" ? (
                <div className={classes.buttonsCont}>
                  <LinkButton
                    variant="outlined"
                    startIcon={<EditIcon />}
                    size="medium"
                    href={`me/organization/${activeOrg?.id}`}
                  >
                    Edit details
                  </LinkButton>
                  <LinkButton
                    variant="outlined"
                    startIcon={<UsersIcon />}
                    size="medium"
                    href={`me/organization/${activeOrg?.id}/users`}
                  >
                    Manage Users
                  </LinkButton>
                  <LinkButton
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    size="medium"
                    href={`notImplementedYet`}
                  >
                    Organization Settings
                  </LinkButton>
                </div>
              ) : (
                <Typography variant="h6">
                  This is user scoped organization
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography className={classes.orgHeader} variant="h4">
              More Available Organizations: {createButton}
            </Typography>
          </Grid>
          {orgs.map((organization) => (
            <Grid key={organization.id} item xs={4}>
              <Card className={classes.cardWrapper}>
                {organization.image && (
                  <CardMedia
                    component="img"
                    className={classes.media}
                    image={organization.image}
                    alt={`${organization.name}'s logo`}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {organization.name}
                  </Typography>
                  <Typography gutterBottom variant="subtitle2" component="h2">
                    {`${organization.name}'s domain`}
                  </Typography>
                </CardContent>
                <CardActions className={classes.cardActions}>
                  <div>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() =>
                        router.push(`/me/organization/${organization.id}`)
                      }
                    >
                      EDIT
                    </Button>
                  </div>
                  {organization.id === activeOrg?.id && (
                    <Chip
                      size="small"
                      label="Active"
                      classes={{
                        root: classes.chip,
                      }}
                    />
                  )}
                  {organization.id !== activeOrg?.id && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => setActiveOrg(organization)}
                    >
                      SWITCH
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </div>
  );
}
