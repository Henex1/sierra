import React, { ReactElement } from "react";
import classnames from "classnames";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { ErrorBox } from "../ErrorBox";
import { useStyles } from "../hooks";
import { FailedSearchPhraseExecution } from "../../../lib/execution/ExposedSearchPhrase";

export interface Props {
  item: FailedSearchPhraseExecution;
}

export function ErrorItem({ item }: Props): ReactElement {
  const classes = useStyles();

  return (
    <Tooltip title={item.error} placement="right" arrow>
      <div>
        <ListItem
          button
          className={classnames(classes.listItem, classes.errorItem)}
          selected={true}
        >
          <ListItemAvatar className={classes.avatarBox}>
            <ErrorBox />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="h6" className={classes.phrase}>
                {item.phrase}
              </Typography>
            }
          />
        </ListItem>
      </div>
    </Tooltip>
  );
}
