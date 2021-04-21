import * as React from "react";

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { useActiveProject } from "../../components/Session";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export default function SearchPhrases() {
  const { project } = useActiveProject();

  return (
    <div style={{ height: "90%" }}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Search Phrases</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Search Phrases</Typography>
        </Grid>
        {!project &&
          <Grid item xs={6} style={{ margin: "0 auto", textAlign: "center"}}>
            <Typography variant="h6">No project is active</Typography>
            <Typography variant="subtitle1">You must setup or activate project first</Typography>
          </Grid>
        }
      </Grid>
    </div>
  )
}
