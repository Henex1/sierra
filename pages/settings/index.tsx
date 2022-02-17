import * as React from "react";

import Typography from "@material-ui/core/Typography";
import { Card, CardContent, Grid, makeStyles } from "@material-ui/core";

import Link from "components/common/Link";
import ApiKeys from "components/profile/ApiKeys";
import BreadcrumbsButtons from "components/common/BreadcrumbsButtons";

import { authenticatedPage } from "../../lib/pageHelpers";
import {
  ExposedApiKey,
  formatApiKey,
  listApiKeys,
} from "../../lib/users/apikey";

const useStyles = makeStyles((theme) => ({
  container: {
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

export default function Settings({ apikeys }: Props) {
  const classes = useStyles();

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Settings</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12} className={classes.container}>
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
