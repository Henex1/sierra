import React, { ReactElement, useCallback } from "react";
import {
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  Typography,
} from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { useStyles } from "../hooks";
import classNames from "classnames";
import PhraseScore from "../PhraseScore";
import { ScoredSearchPhraseExecution } from "../../../lib/execution/ExposedSearchPhrase";

export interface Props {
  onClick: (item: ScoredSearchPhraseExecution) => void;
  item: ScoredSearchPhraseExecution;
  selected: boolean;
}

export function Item({ onClick, item, selected }: Props): ReactElement {
  const classes = useStyles();
  const handleClick = useCallback(() => onClick(item), [onClick, item]);

  return (
    <ListItem
      button
      onClick={handleClick}
      selected={selected}
      className={classNames(classes.listItem, selected && classes.fade)}
    >
      <ListItemAvatar className={classes.avatarBox}>
        <PhraseScore score={item.combinedScore} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <>
            <Typography variant="h6" className={classes.phrase}>
              {item.phrase}
            </Typography>
            <Tooltip title={`Took ${item.tookMs}ms to query.`}>
              <Typography
                component="span"
                variant="caption"
                className={classes.took}
                color="textSecondary"
              >
                {item.tookMs}ms
              </Typography>
            </Tooltip>
          </>
        }
        secondary={item.results + " results"}
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="Details" onClick={handleClick}>
          {selected ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
