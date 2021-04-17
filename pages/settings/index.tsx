import * as React from "react";

import Typography from "@material-ui/core/Typography";

import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export default function Index() {
  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Settings</Typography>
      </BreadcrumbsButtons>
    </div>
  )
}
