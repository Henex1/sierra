import * as React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import EditIcon from '@material-ui/icons/Edit';
import BusinessIcon from '@material-ui/icons/Business';

import { authenticatedPage } from "../../../lib/pageHelpers";
import { ExposedOrg, listOrgs, formatOrg } from "../../../lib/org";

import { useActiveOrg } from "../../../components/Session";
import Link, { LinkButton } from "../../../components/common/Link";
import BreadcrumbsButtons from "../../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const orgs = await listOrgs(context.user);
  return { props: { orgs: orgs.map(formatOrg) } };
});

type Props = {
  orgs: ExposedOrg[];
};

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between"
  },
  editButton: {
    marginRight: theme.spacing(3)
  }
}));


export default function Index({ orgs }: Props) {
  const classes = useStyles();
  const { activeOrg } = useActiveOrg();

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Active Organization</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12} className={classes.header}>
          <Typography variant="h4">{activeOrg?.name}</Typography>
          <div>
            <LinkButton
              className={classes.editButton}
              variant="outlined"
              startIcon={<EditIcon />}
              size="medium"
              href={`organization/${activeOrg?.id}`}
            >
              Edit details
            </LinkButton>
            {orgs?.length > 1 &&
              <LinkButton
                variant="outlined"
                startIcon={<BusinessIcon/>}
                size="medium"
                href="organizations"
              >
                Show more available organizations
              </LinkButton>
            }
          </div>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="overline">Name</Typography>
          <Typography variant="h5">{activeOrg?.name}</Typography>
        </Grid>
        <Grid item xs={12} style={{display: "flex", alignItems: "center"}}>
          <div>
            <Typography variant="overline">Image</Typography>
            <Typography variant="h5">{activeOrg?.image}</Typography>
          </div>
          <img src={activeOrg?.image ? activeOrg.image: ""} alt="Organization image"/>
        </Grid>
      </Grid>
    </div>
  );
}
