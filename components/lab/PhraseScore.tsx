import * as React from "react";
import { Avatar, Tooltip, colors } from "@material-ui/core";
import { scaleLinear } from "d3-scale";
import { useStyles } from "./hooks";

const colorScale = scaleLinear<string, string>()
  .domain([0, 50, 100])
  .range([colors.red[500], colors.yellow[500], colors.green[500]]);

type Props = {
  score: number;
};

export default function PhraseScore({ score }: Props) {
  const classes = useStyles();

  return (
    <Tooltip title="Sierra score">
      <Avatar
        variant="rounded"
        className={classes.scoreBoxAvatar}
        style={{
          background: colorScale(score),
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
}
