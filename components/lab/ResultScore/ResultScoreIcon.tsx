import React from "react";
import { makeStyles } from "@material-ui/core";
import { scaleLinear } from "d3-scale";

const colorScale = scaleLinear<string, string>()
  .domain([0, 1, 2, 3])
  .range(["#FF6A6B", "#FFAB61", "#CCD766", "#91D16F"]);

type ScoreIconProps = {
  score?: number;
};

const useStyles = makeStyles(() => ({
  score: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    height: "36px",
    fontSize: "35px",
    fontWeight: 600,
    backgroundColor: "transparent",
  },
}));

export const ResultScoreIcon = ({ score }: ScoreIconProps) => {
  const classes = useStyles();

  return (
    <div
      className={classes.score}
      style={{
        color: score !== undefined ? colorScale(score) : undefined,
      }}
    >
      {score === undefined
        ? "--"
        : Number.isInteger(score)
        ? score
        : score.toFixed(1)}
    </div>
  );
};
