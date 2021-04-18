import * as React from "react";

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";
import Link from "../../components/common/Link";

export default function LabNoProject() {
  return (
    <div style={{ height: "90%" }}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Lab</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={6} style={{ margin: "0 auto", textAlign: "center"}}>
          <Typography variant="h6">No project is active</Typography>
          <Typography variant="subtitle1">You must setup project first</Typography>
        </Grid>
      </Grid>
    </div>
  )
}
