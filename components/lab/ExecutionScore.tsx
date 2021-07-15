import * as React from "react";
import { Avatar, Tooltip, colors } from "@material-ui/core";
import { scaleLinear } from "d3-scale";
import { useStyles } from "./hooks";

const colorScale = scaleLinear<string, string>()
  .domain([0, 50, 100])
  .range([colors.red[500], colors.yellow[500], colors.green[500]]);

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
