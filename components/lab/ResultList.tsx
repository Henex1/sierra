import React from "react";
import {
  Grid,
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  ClickAwayListener,
  makeStyles,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import CloseIcon from "@material-ui/icons/Close";
import useSWR from "swr";

import { useActiveProject } from "../../components/Session";
import { MockSearchPhrase, MockSearchResult } from "../../lib/lab";

import ScoreBox from "./ScoreBox";
import ExplainBlock from "./ExplainBlock";
import Link from "../common/Link";
import Scrollable from "../common/Scrollable";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  scrollable: {
    marginTop: theme.spacing(2),
    flex: "1 1 100%",
  },
  actions: {
    flex: "none",
  },
  paper: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  content: {
    paddingRight: theme.spacing(1),
  },
  withLabel: {
    "&:hover $label": {
      display: "block",
    },
  },
  label: {
    display: "none",
  },
  tableRow: {
    verticalAlign: "top",
  },
  tableCell: {
    padding: theme.spacing(2, 1),
  },
  title: {
    fontWeight: 500,
  },
}));

type Props = {
  searchPhrase: MockSearchPhrase;
  onClose: () => void;
};

export default function ResultList({ searchPhrase, onClose }: Props) {
  const classes = useStyles();
  const { project } = useActiveProject();

  const { data, error } = useSWR<MockSearchResult[]>(
    `/api/lab/searchResult?projectId=${project?.id}&searchPhraseId=${searchPhrase.id}`
  );

  if (!data) {
    return (
      <ClickAwayListener onClickAway={onClose}>
        <Box mt={10}>
          {Array.from(Array(5)).map((item, i) => (
            <Box key={i} marginLeft={3} my={4}>
              <Grid container>
                <Grid item xs={1}>
                  <Skeleton
                    animation="wave"
                    variant="circle"
                    width={50}
                    height={50}
                  />
                </Grid>
                <Grid item xs>
                  <Skeleton animation="wave" variant="text" />
                  <Skeleton animation="wave" variant="text" />
                  <Skeleton animation="wave" variant="text" />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </ClickAwayListener>
    );
  }

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div className={classes.root}>
        <Grid
          container
          justify="flex-end"
          alignItems="center"
          spacing={1}
          className={classes.actions}
        >
          <Grid item>
            <Button variant="outlined">Ignore</Button>
          </Grid>
          <Grid item>
            <Button variant="outlined">Notes</Button>
          </Grid>
          <Grid item>
            <Button variant="outlined">Explain missing documents</Button>
          </Grid>
          <Grid item>
            <IconButton aria-label="close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Scrollable
          maxHeight="calc(100vh - 350px)"
          classes={{
            root: classes.scrollable,
          }}
        >
          {data.map((result) => (
            <Paper key={result.id} className={classes.paper}>
              <Grid container>
                <Grid item xs={1}>
                  <ScoreBox score={result.score} />
                </Grid>
                <Grid item xs={8} className={classes.content}>
                  <Box mb={1} className={classes.withLabel}>
                    <Typography
                      color="textSecondary"
                      variant="caption"
                      className={classes.label}
                    >
                      Base name
                    </Typography>
                    <Typography color="textPrimary" className={classes.title}>
                      {result.url ? (
                        <Link href={result.url}>{result.title}</Link>
                      ) : (
                        result.title
                      )}
                    </Typography>
                  </Box>
                  <Box className={classes.withLabel}>
                    <Typography
                      color="textSecondary"
                      variant="caption"
                      className={classes.label}
                    >
                      Short description
                    </Typography>
                    <Typography>
                      {result.description || "No description"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <ExplainBlock {...result.matches} />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Scrollable>
      </div>
    </ClickAwayListener>
  );
}
