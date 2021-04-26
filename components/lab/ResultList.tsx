import React from "react";
import {
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  IconButton,
  Typography,
  Link,
  Box,
  ClickAwayListener,
  makeStyles,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import CloseIcon from "@material-ui/icons/Close";
import classnames from "classnames";

import { MockSearchPhrase } from "../../lib/lab";

import ScoreBox from "./ScoreBox";
import ExplainBlock from "./ExplainBlock";
import Scrollable from "../common/Scrollable";
import explanationSample from "./explanationSample.json";

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
  tableRow: {
    verticalAlign: "top",
  },
  title: {
    marginBottom: theme.spacing(0.5),
  },
}));

type MockResults = {
  id: number;
  title: string;
  description: string;
  score: number;
};

function mockGetResults(id: number): Promise<MockResults[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        Array.from(Array(10)).map((item, i) => ({
          id: i,
          title: `Result item ${id}-${i}`,
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          score: Math.round(Math.random() * 100),
        }))
      );
    }, 1500);
  });
}

function mockExplainBlockProps() {
  const scores: {
    name: string;
    score: number;
  }[] = [
    { name: 'es_title.localized:"per applianc licens"', score: 210.5973 },
    { name: 'es_title.localized:"per applianc"', score: 143.95348 },
    { name: 'es_text.localized:"per applianc licens"', score: 131.2363 },
    { name: 'es_text.localized:"per applianc"', score: 87.43645 },
    { name: 'es_title.localized:"per"', score: 17.299545 },
    { name: 'es_title.localized:"applianc"', score: 13.328762 },
    { name: 'es_title.localized:"licens"', score: 11.491154 },
    { name: 'es_text.localized:"per"', score: 3.8000762 },
    { name: 'es_text.localized:"applianc"', score: 3.7269855 },
    { name: 'es_text.localized:"licens"', score: 3.612312 },
    { name: "Constant Scored Query", score: 0 },
  ];
  const totalScore = scores.reduce((result, item) => {
    return result + item.score;
  }, 0);

  return {
    scores,
    explanation: {
      summary:
        `${totalScore} Sum of the following:\n` +
        scores.map((item) => `\n${item.score} ${item.name}\n`).join(""),
      json: explanationSample,
    },
  };
}

type Props = {
  searchPhrase: MockSearchPhrase;
  onClose: () => void;
};

export default function ResultList({ searchPhrase, onClose }: Props) {
  const classes = useStyles();
  const [results, setResults] = React.useState<MockResults[] | null>(null);

  React.useEffect(() => {
    setResults(null);
    async function getResults() {
      setResults(await mockGetResults(searchPhrase.id));
    }
    getResults();
  }, [searchPhrase]);

  const explainBlockProps = mockExplainBlockProps();

  if (!results) {
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
          <Table>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id} className={classes.tableRow}>
                  <TableCell>
                    <ScoreBox score={result.score} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="h5" className={classes.title}>
                      <Link href="#">{result.title}</Link>
                    </Typography>
                    <Typography>{result.description}</Typography>
                  </TableCell>
                  <TableCell width="33%">
                    <ExplainBlock {...explainBlockProps} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollable>
      </div>
    </ClickAwayListener>
  );
}
