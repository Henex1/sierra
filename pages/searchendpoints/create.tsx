import * as React from "react";
import { useRouter } from "next/router";

import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { ExposedSearchEndpoint } from "../../lib/searchendpoints";
import { authenticatedPage } from "../../lib/pageHelpers";
import { apiRequest } from "../../lib/api";
import Form from "../../components/searchendpoints/Form";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage();

const useStyles = makeStyles(() => ({
  wrapper: {
    height: "100%",
  },
}));

export default function CreateSearchEndpoint() {
  const classes = useStyles();
  const router = useRouter();

  async function onSubmit(values: ExposedSearchEndpoint) {
    await create(values);
    router.push("/searchendpoints");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <div className={classes.wrapper}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/searchendpoints">Search Endpoints</Link>
        <Typography>New Search Endpoint</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Create new search endpoint:</Typography>
        </Grid>
        <Grid item xs={6}>
          <Form onSubmit={onSubmit} />
        </Grid>
      </Grid>
    </div>
  );
}

export async function create(values: ExposedSearchEndpoint) {
  const newSearchEndpoint = {
    ...values,
    whitelist: values.whitelist ? values.whitelist : [],
    description: values.description ? values.description : "",
  };
  return await apiRequest(`/api/searchendpoints`, newSearchEndpoint);
}
