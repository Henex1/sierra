import React from "react";
import { Tooltip, Avatar, colors } from "@material-ui/core";
import { scaleLinear } from "d3-scale";
import { useStyles } from "../hooks";

const colorScale = scaleLinear<string, string>()
  .domain([0, 1, 3])
  .range([colors.red[500], colors.yellow[500], colors.green[500]]);

type ScoreIconProps = {
  score?: number;
};

export const ResultScoreIcon = ({ score }: ScoreIconProps) => {
  const classes = useStyles();

  return (
    <Tooltip title="Combined judgement">
      <Avatar
        variant="rounded"
        className={classes.scoreBoxAvatar}
        style={{
          background: score !== undefined ? colorScale(score) : undefined,
        }}
      >
        {score === undefined
          ? "--"
          : Number.isInteger(score)
          ? score
          : score.toFixed(1)}
      </Avatar>
    </Tooltip>
  );
};
