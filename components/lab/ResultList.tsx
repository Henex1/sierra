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

const useStyles = makeStyles((theme) => ({
  root: {
    position: "sticky",
    top: 80,
    maxHeight: `calc(100vh - 350px)`,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  actions: {
    flex: "none",
  },
  tableContainer: {
    marginTop: theme.spacing(2),
    flex: "1 1 100%",
    overflowX: "hidden",
    overflowY: "auto",
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

  if (!results) {
    return (
      <ClickAwayListener onClickAway={onClose}>
        <Box mt={10}>
          {Array.from(Array(5)).map((item, i) => (
            <Box marginLeft={3} my={4}>
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
        <div className={classnames(classes.tableContainer, "custom-scrollbar")}>
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
                  <TableCell>Explain block</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ClickAwayListener>
  );
}
