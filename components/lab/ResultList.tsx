import React from "react";
import {
  Grid,
  Paper,
  Button,
  Box,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { Skeleton } from "@material-ui/lab";
import useSWR from "swr";
import { ExposedSearchPhrase, MockSearchResult } from "../../lib/lab";

import ResultScore from "./ResultScore";
import ExplainBlock from "./ExplainBlock";
import { ResultCard } from "./ResultCard";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  container: {
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
}));

type Props = {
  searchPhrase: ExposedSearchPhrase;
  onClose: () => void;
  displayFields: string[];
};

export function ResultList({ displayFields, onClose, searchPhrase }: Props) {
  const classes = useStyles();
  const { data } = useSWR<MockSearchResult[]>(
    `/api/lab/searchResult?id=${searchPhrase.id}`
  );

  if (!data) {
    return (
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
    );
  }

  return (
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
        <div className={classes.container}>
          {data.map((result) => (
            <Paper key={result.id} className={classes.paper}>
              <Grid container>
                <Grid item xs={1}>
                  <ResultScore score={result.score} />
                </Grid>
                <Grid item xs={8} className={classes.content}>
                  <ResultCard displayFields={displayFields} result={result} />
                </Grid>
                <Grid item xs={3}>
                  <ExplainBlock {...result.matches} />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </div>
      </Grid>
    </div>
  );
}
