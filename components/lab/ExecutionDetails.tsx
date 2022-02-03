import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ExposedSearchConfiguration } from "../../lib/searchconfigurations";

const useStyles = makeStyles(() => ({
  paper: {
    width: "250px",
    padding: "15px",
    position: "relative",
    left: "14px",
    border: "1px solid #ebebeb",
    boxShadow: "0px 10px 10px rgba(0, 0, 0, 0.1)",
  },
  paperArrow: {
    height: "16px",
    width: "16px",
    backgroundColor: "#fff",
    position: "absolute",
    top: "30%",
    "&.left": {
      left: 0,
      borderBottom: "1px solid #ebebeb",
      borderLeft: "1px solid #ebebeb",
      transform: "translate(-50%, -50%) rotate(45deg)",
    },
    "&.right": {
      right: 0,
      borderTop: "1px solid #ebebeb",
      borderRight: "1px solid #ebebeb",
      transform: "translate(50%, -50%) rotate(45deg)",
    },
  },
  field: {
    "& b": {
      fontSize: "15px",
      lineHeight: "20px",
    },
    "& p": {
      fontSize: "15px",
      lineHeight: "20px",
      color: "#525252",
      margin: "2px 0 0 0",
    },
  },
}));

type Props = {
  anchorEl: null | HTMLElement;
  floatingElRef: React.RefObject<HTMLElement>;
  searchConfig: null | ExposedSearchConfiguration;
};

export default function ExecutionDetails({
  anchorEl,
  floatingElRef,
  searchConfig,
}: Props) {
  const classes = useStyles();
  const [arrowDir, setArrowDir] = useState("left");

  useEffect(() => {
    if (!anchorEl || !floatingElRef.current) return;

    setArrowDir(
      anchorEl.getBoundingClientRect().x >
        floatingElRef.current.getBoundingClientRect().x
        ? "right"
        : "left"
    );
  }, [floatingElRef.current]);

  if (!searchConfig) return null;

  const date = new Date(searchConfig.createdAt);

  return (
    <Paper className={classes.paper}>
      <div className={classnames(classes.paperArrow, arrowDir)} />
      <div>
        <div className={classes.field}>
          <b>Date Created</b>
          <p>
            {date.getDate()} {date.toLocaleString("default", { month: "long" })}{" "}
            {date.getFullYear()}
          </p>
        </div>
      </div>
    </Paper>
  );
}
