import React from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import classnames from "classnames";

import { MockSearchPhrase } from "../../lib/lab";
import ScoreBox from "./ScoreBox";

const useStyles = makeStyles((theme) => ({
  list: {
    margin: 0,
    padding: 0,
  },
  listItem: {
    borderBottom: "1px solid rgba(224, 224, 224, 1)",
    "$list li:last-child &": {
      borderBottom: "none",
    },
  },
  empty: {
    marginTop: theme.spacing(16),
    marginBottom: theme.spacing(16),
    textAlign: "center",
  },
  avatarBox: {
    minWidth: 76,
  },
  phrase: {
    display: "inline",
  },
  took: {
    marginLeft: theme.spacing(1),
  },
  fade: {
    opacity: 0.5,
  },
}));

type Props = {
  searchPhrases: MockSearchPhrase[];
  activePhrase: MockSearchPhrase | null;
  setActivePhrase: (value: MockSearchPhrase | null) => void;
};

export default function SearchPhraseList({
  searchPhrases,
  activePhrase,
  setActivePhrase,
}: Props) {
  const classes = useStyles();

  if (!searchPhrases.length) {
    <Typography variant="body1" className={classes.empty}>
      No results.
    </Typography>;
  }

  return (
    <>
      <List className={classes.list}>
        {searchPhrases.slice(0, 10).map((item, i) => {
          const handleClick = (
            e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>
          ) => {
            e.stopPropagation();
            if (activePhrase?.id !== item.id) {
              setActivePhrase(item);
            } else {
              setActivePhrase(null);
            }
          };
          const mockQueryTime = Math.round(Math.random() * 1000);

          return (
            <ListItem
              key={i}
              button
              onClick={handleClick}
              selected={activePhrase?.id === item.id}
              className={classnames(
                classes.listItem,
                activePhrase && activePhrase?.id !== item.id && classes.fade
              )}
            >
              <ListItemAvatar className={classes.avatarBox}>
                <ScoreBox score={item.score.sierra} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    <Typography variant="h6" className={classes.phrase}>
                      {item.phrase}
                    </Typography>
                    <Tooltip title={`Took ${mockQueryTime}ms to query`}>
                      <Typography
                        component="span"
                        variant="caption"
                        className={classes.took}
                        color="textSecondary"
                      >
                        {mockQueryTime}ms
                      </Typography>
                    </Tooltip>
                  </>
                }
                secondary={item.results + " results"}
              ></ListItemText>
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="Details"
                  onClick={handleClick}
                >
                  {activePhrase?.id === item.id ? (
                    <ChevronLeftIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}
