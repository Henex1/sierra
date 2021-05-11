import * as React from "react";

import Typography from "@material-ui/core/Typography";
import { Grid } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";

import {
  authenticatedPage,
  requireNumberParam,
} from "../../../../lib/pageHelpers";
import BreadcrumbsButtons from "../../../../components/common/BreadcrumbsButtons";
import Link, { LinkButton } from "../../../../components/common/Link";
import { ExposedOrg, formatOrg, getOrg } from "../../../../lib/org";
import CreateOrganizationForm from "../../../../components/organization/CreateOrganizationForm";
import { ExposedRuleset } from "../../../../lib/rulesets";
import { apiRequest } from "../../../../lib/api";
import { useRouter } from "next/router";

export const getServerSideProps = authenticatedPage(async (context) => {
  const orgId = requireNumberParam(context, "orgId");
  const organization = await getOrg(context.user, orgId);
  return {
    props: {
      org: organization && formatOrg(organization),
    },
  };
});

const useStyles = makeStyles((theme) => ({
  headerWrapper: {
    display: "flex",
    justifyContent: "space-between",
  },
}));

type Props = {
  org: ExposedOrg;
};

export default function EditOrganization({ org }: Props) {
  const classes = useStyles();
  const router = useRouter();

  async function onSubmit(values: ExposedOrg) {
    await apiRequest(`/api/organization/create`, values);
    router.push("/me/organization");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/me/organization">Organization</Link>
        <Typography>{org.name}</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12} className={classes.headerWrapper}>
          <Typography variant="h4">Edit Organization</Typography>
          <LinkButton
            variant="outlined"
            startIcon={<EditIcon />}
            size="medium"
            href={`${org.id}/users`}
          >
            Manage Users
          </LinkButton>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Organization details</Typography>
        </Grid>
        <Grid item xs={7}>
          <CreateOrganizationForm onSubmit={onSubmit} initialValues={org} />
        </Grid>
      </Grid>
    </div>
  );
}
