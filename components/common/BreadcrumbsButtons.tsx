import * as React from "react";

import Box from "@material-ui/core/Box";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";

type BreadcrumbsButtons = {
  children?: React.ReactNode;
};

export default function BreadcrumbsButtons({ children }: BreadcrumbsButtons) {
  return (
    <div>
      <Box display="flex" mb={4}>
        <Breadcrumbs aria-label="breadcrumb">
          {children}
        </Breadcrumbs>
      </Box>
    </div>
  )
}
