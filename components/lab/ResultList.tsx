import React from "react";
import {
  Grid,
  Paper,
  Button,
  Box,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { Skeleton } from "@material-ui/lab";
import useSWR from "swr";
import { ExposedSearchPhrase, MockSearchResult } from "../../lib/lab";

import ResultScore from "./ResultScore/ResultScore";
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
    fontFamily: "Source Sans Pro",
    padding: theme.spacing(1),
    marginBottom: theme.spacing(3),
    maxWidth: theme.spacing(100),
    maxHeight: theme.spacing(35),
    overflow: "auto",

    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": {
      height: 8,
      width: 8,
    },
    "&::-webkit-scrollbar-track": {
      borderRadius: 8,
      backgroundColor: "#EFEFEF",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: 8,
      backgroundColor: "#C3C3C3",
    },
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
  const { data, mutate } = useSWR<MockSearchResult[] | { error: string }>(
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

  if ("error" in data) {
    switch (data.error) {
      case "ECONNREFUSED":
        return (
          <Box marginTop={5}>
            <Typography variant="h4">Connection refused</Typography>
            <Box marginBottom={3}>
              <Typography color="error" style={{ fontWeight: "bold" }}>
                Failed to connect to the search endpoint
              </Typography>
            </Box>
            <Typography style={{ fontWeight: "bold" }}>
              Possible solutions:
            </Typography>
            <ul style={{ padding: "0 16px", margin: "8px 0" }}>
              <li>Check if the search endpoint is running</li>
              <li>
                Go to &quot;search endpoint &gt; edit&quot; and test the
                connection
              </li>
            </ul>
          </Box>
        );
      default:
        return (
          <Box marginTop={5}>
            <Typography variant="h4">Internal server error</Typography>
            <Box marginBottom={3}>
              <Typography color="error" style={{ fontWeight: "bold" }}>
                An internal error has occurred and logged
              </Typography>
            </Box>
          </Box>
        );
    }
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
                  <ResultScore
                    result={result}
                    searchPhrase={searchPhrase}
                    onChange={mutate}
                  />
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
