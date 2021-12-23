import * as React from "react";

import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { authenticatedPage } from "../../../lib/pageHelpers";
import {
  ExposedOrg,
  listOrgs,
  formatOrg,
  canCreateOrg,
} from "../../../lib/org";
import { useActiveOrg } from "../../../components/Session";
import Link from "../../../components/common/Link";
import BreadcrumbsButtons from "../../../components/common/BreadcrumbsButtons";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Grid,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { useRouter } from "next/router";
import { CreateButton } from "../organization/create/CreateButton";

export const getServerSideProps = authenticatedPage(async (context) => {
  const orgs = await listOrgs(context.user);
  return {
    props: {
      orgs: orgs.map(formatOrg),
      canCreate: canCreateOrg(context.user),
    },
  };
});

type Props = {
  orgs: ExposedOrg[] & { domain: string };
  canCreate: boolean;
};

const useStyles = makeStyles(() => ({
  cardWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  contentWrapper: {
    flexGrow: 10,
  },
  media: {
    height: 140,
    objectFit: "contain",
  },
  cardActions: {
    display: "flex",
    justifyContent: "space-between",
  },
  chipRoot: {
    color: "white",
    backgroundColor: green[700],
  },
}));

export default function Index({ orgs, canCreate }: Props) {
  const classes = useStyles();
  const router = useRouter();

  const { activeOrg, setActiveOrg } = useActiveOrg();

  const createButton = canCreate ? <CreateButton /> : null;

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/me/organization">Organization</Link>
        <Typography>Organizations</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">My organizations {createButton}</Typography>
        </Grid>
        {orgs.map((organization) => (
          <Grid key={organization.id} item xs={4}>
            <Card className={classes.cardWrapper}>
              {organization.image ? (
                <CardMedia
                  component="img"
                  className={classes.media}
                  image={organization.image}
                  alt={`${organization.name}'s logo`}
                />
              ) : (
                <div className={classes.media} />
              )}
              <CardContent className={classes.contentWrapper}>
                <Typography gutterBottom variant="h5" component="h2">
                  {organization.name}
                </Typography>
                <Typography gutterBottom variant="subtitle2" component="h2">
                  {`${organization.name}'s domain`}
                </Typography>
              </CardContent>
              <CardActions className={classes.cardActions}>
                <div>
                  {organization.id !== activeOrg?.id && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => setActiveOrg(organization)}
                    >
                      ACTIVATE
                    </Button>
                  )}
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
                      root: classes.chipRoot,
                    }}
                  />
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
