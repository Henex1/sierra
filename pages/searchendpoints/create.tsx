import { useRouter } from "next/router";

import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { ExposedSearchEndpoint } from "../../lib/searchendpoints";
import { authenticatedPage } from "../../lib/auth";
import { apiRequest } from "../../lib/api";
import Form from "../../components/searchendpoints/Form";
import Box from "@material-ui/core/Box";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import * as React from "react";
import Link from "../../components/common/Link";

export const getServerSideProps = authenticatedPage();

const useStyles = makeStyles(() => ({
  wrapper: {
    height: "100%"
  }
}));

export default function CreateSearchEndpoint() {
  const classes = useStyles();
  const router = useRouter();

  async function onSubmit(values: ExposedSearchEndpoint) {
    const newSearchEndpoint = {
      ...values,
      whitelist: values.whitelist ? values.whitelist : [],
      description: values.description ? values.description : ''
    }
    await apiRequest(`/api/searchendpoints`, newSearchEndpoint);
    router.push("/searchendpoints");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <div className={classes.wrapper}>
      <Box display="flex" mb={4}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link href="/searchendpoints">Search Endpoints</Link>
          <Typography>New Search Endpoints</Typography>
        </Breadcrumbs>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">
            Create new search endpoint:
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Form onSubmit={onSubmit}/>
        </Grid>
      </Grid>
    </div>
  );
}
