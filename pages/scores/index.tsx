import * as React from "react";

import Typography from "@material-ui/core/Typography";

import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export default function Scores() {
  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Scores</Typography>
      </BreadcrumbsButtons>
    </div>
  )
}
