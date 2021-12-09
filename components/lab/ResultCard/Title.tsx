import React, { ReactElement } from "react";
import { Box, Typography } from "@material-ui/core";
import Link from "../../common/Link";
import { useStyles } from "./styles";

export interface Props {
  field: string;
  title: string;
  url?: string;
}

export const Title = ({ field, title, url }: Props): ReactElement => {
  const classes = useStyles();
  return (
    <Box mb={1} key={field}>
      <Typography color="textPrimary" className={classes.title}>
        {url ? <Link href={url}>{title}</Link> : title}
      </Typography>
    </Box>
  );
};
