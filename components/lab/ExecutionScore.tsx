import * as React from "react";
import { Avatar, Tooltip } from "@material-ui/core";
import { scaleLinear } from "d3-scale";
import { useStyles } from "./hooks";

const colorScale = scaleLinear<string, string>()
  .domain([0, 25, 50, 75, 100])
  .range(["#FF6A6B", "#FFAB61", "#FFD864", "#CCD766", "#91D16F"]);

type Props = {
  tooltip: React.ReactNode;
  score: number | null;
};

export default function ExecutionScore({ tooltip, score }: Props) {
  const classes = useStyles();

  return (
    <Tooltip title={tooltip || ""}>
      <Avatar
        variant="circle"
        className={classes.executionScore}
        style={{
          background: score !== null ? colorScale(score) : undefined,
        }}
      >
        {score === null
          ? "--"
          : Number.isInteger(score)
          ? score
          : score.toFixed(1)}
      </Avatar>
    </Tooltip>
  );
}
