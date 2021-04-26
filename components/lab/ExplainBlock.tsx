import React from "react";
import {
  Grid,
  Typography,
  LinearProgress,
  Box,
  Button,
  IconButton,
  Popover,
  Divider,
  makeStyles,
} from "@material-ui/core";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import InfoIcon from "@material-ui/icons/Info";
import ListIcon from "@material-ui/icons/List";
import CodeIcon from "@material-ui/icons/Code";

import Scrollable from "../common/Scrollable";

type Props = {
  scores: {
    name: string;
    score: number;
  }[];
  explanation: {
    summary: string;
    json: {
      [key: string]: any;
    };
  };
};

export default function ExplainBlock({ scores, explanation }: Props) {
  const [showAll, setShowAll] = React.useState(false);
  const totalScore = scores.reduce((result, item) => {
    return result + item.score;
  }, 0);

  const renderedScores = showAll ? scores : scores.slice(0, 3);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div>
      <Box display="flex" alignItems="center">
        <Typography variant="subtitle2">Matches</Typography>
        <DetailPopover totalScore={totalScore} explanation={explanation} />
      </Box>
      {renderedScores.map((item, i) => (
        <Box key={i} mt={1}>
          <Typography variant="body2">{item.name}</Typography>
          <LinearProgress
            variant="determinate"
            value={Math.round((item.score / totalScore) * 100)}
          />
        </Box>
      ))}
      {scores.length > 3 && (
        <Box mt={1}>
          <Button onClick={toggleShowAll} size="small">
            {showAll ? "Show less" : "Show all"}
          </Button>
        </Box>
      )}
    </div>
  );
}

const useDetailPopoverStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    width: "90vw",
    height: "90vh",
    maxWidth: 500,
    maxHeight: 500,
  },
  scrollable: {
    background: "#F5F7FA",
  },
}));

type DetailPopoverProps = Pick<Props, "explanation"> & {
  totalScore: number;
};

function DetailPopover({ totalScore, explanation }: DetailPopoverProps) {
  const classes = useDetailPopoverStyles();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  const [view, setView] = React.useState<"summary" | "json">("summary");
  const handleChange = (e: React.MouseEvent, newValue: string) => {
    if (newValue === "summary" || newValue === "json") {
      setView(newValue);
    }
  };

  return (
    <div>
      <IconButton aria-label="show details" size="small" onClick={handleClick}>
        <InfoIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div className={classes.container}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography>
                Relevancy score:{" "}
                <b>
                  {Number.isInteger(totalScore)
                    ? totalScore
                    : totalScore.toFixed(2)}
                </b>
              </Typography>
            </Grid>
            <Grid item>
              <ToggleButtonGroup
                exclusive
                value={view}
                onChange={handleChange}
                aria-label="Set view mode"
                size="small"
              >
                <ToggleButton value="summary" aria-label="summary view">
                  <ListIcon />
                </ToggleButton>
                <ToggleButton value="json" aria-label="JSON view">
                  <CodeIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
          <Box mt={2} mb={2}>
            <Divider />
          </Box>
          <Scrollable
            maxHeight={400}
            allowFullscreen
            classes={{
              scroll: classes.scrollable,
            }}
          >
            <pre>
              <code>
                {view === "json"
                  ? JSON.stringify(explanation.json, null, 2)
                  : explanation.summary}
              </code>
            </pre>
          </Scrollable>
        </div>
      </Popover>
    </div>
  );
}
