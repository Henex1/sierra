import React from "react";
import { CircularProgress, makeStyles } from "@material-ui/core";
import { scaleLinear } from "d3-scale";

const colorScale = scaleLinear<string, string>()
  .domain([0, 1, 2, 3])
  .range(["#FF6A6B", "#FFAB61", "#CCD766", "#91D16F"]);

type ScoreIconProps = {
  score?: number;
  loading?: boolean;
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
  loader: {
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
}));

export const ResultScoreIcon = ({ score, loading }: ScoreIconProps) => {
  const classes = useStyles();

  return (
    <div
      className={classes.score}
      style={{
        color: score !== undefined ? colorScale(score) : undefined,
      }}
    >
      {loading ? (
        <div className={classes.loader}>
          <CircularProgress size={25} />
        </div>
      ) : (
        <>
          {score === undefined
            ? "--"
            : Number.isInteger(score)
            ? score
            : score.toFixed(1)}
        </>
      )}
    </div>
  );
};
