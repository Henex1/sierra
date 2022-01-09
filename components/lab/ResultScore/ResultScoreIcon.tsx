import React from "react";
import { scaleLinear } from "d3-scale";
import { IconButton, makeStyles } from "@material-ui/core";
import GavelIcon from "@material-ui/icons/Gavel";

const colorScale = scaleLinear<string, string>()
  .domain([0, 1, 2, 3])
  .range(["#FF6A6B", "#FFAB61", "#CCD766", "#91D16F"]);

type ScoreIconProps = {
  score?: number;
  handleClick: () => any;
  setTooltipIsOpen: (value: boolean) => void;
};

const useStyles = makeStyles(() => ({
  judgmentButton: {
    width: "50px",
    height: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 11px",
    borderRadius: "50px",
    color: "white",
    cursor: "pointer",
  },
  iconButton: {
    width: "35px",
    height: "35px",
  },
  score: {
    fontSize: "15px",
    fontWeight: 400,
  },
}));

export const ResultScoreIcon = ({
  score,
  handleClick,
  setTooltipIsOpen,
}: ScoreIconProps) => {
  const classes = useStyles();

  return (
    <>
      {score ? (
        <IconButton
          classes={{ root: classes.judgmentButton }}
          style={{
            backgroundColor:
              score !== undefined ? colorScale(score) : undefined,
          }}
          onClick={handleClick}
          onMouseEnter={() => setTooltipIsOpen(true)}
          onMouseLeave={() => setTooltipIsOpen(false)}
        >
          <GavelIcon style={{ fontSize: "18px" }} />
          <p className={classes.score}>
            {Number.isInteger(score) ? score : score.toFixed(1)}
          </p>
        </IconButton>
      ) : (
        <IconButton
          classes={{ root: classes.iconButton }}
          onClick={handleClick}
          onMouseEnter={() => setTooltipIsOpen(true)}
          onMouseLeave={() => setTooltipIsOpen(false)}
        >
          <GavelIcon style={{ color: "#C0C0C0" }} fontSize="small" />
        </IconButton>
      )}
    </>
  );
};
