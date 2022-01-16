import React, { useMemo, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import classnames from "classnames";
import {
  ClickAwayListener,
  Fade,
  makeStyles,
  Popper,
  Tooltip,
  Zoom,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import InfoIcon from "@material-ui/icons/Info";

import ExecutionScore from "../lab/ExecutionScore";
import { ExposedExecution } from "../../lib/execution";
import { useLabContext } from "../../utils/react/hooks/useLabContext";
import ExecutionDetails from "./ExecutionDetails";

const useStyles = makeStyles((theme) => ({
  root: {
    overflowX: "auto",
    paddingBottom: "30px",
    width: "90%",
    [theme.breakpoints.down("sm")]: {
      width: "calc(100vw - 32px)",
    },
    "& > div": {
      width: "fit-content",
      position: "relative",
      display: "flex",
      alignItems: "center",
    },

    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": {
      height: 8,
      width: 8,
    },
    "&::-webkit-scrollbar-track": {
      borderRadius: 8,
      backgroundColor: "#EFEFEF",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: 8,
      backgroundColor: "#C3C3C3",
    },
  },
  customTooltip: {
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 5px",
  },
  dividers: {
    position: "absolute",
    display: "flex",
    width: "100%",
    top: "50%",
    zIndex: 1,
  },
  divider: {
    flex: 1,
    width: "100%",
    height: "1px",
    borderBottom: "2px solid #DFDFDF",
  },
  dottedDivider: {
    borderBottom: "2px dotted #DFDFDF",
  },
  viewMoreButton: {
    border: "none",
    borderRadius: "50%",
    background: "transparent",
    padding: "11px",
    marginRight: "3px",
    cursor: "pointer",
    zIndex: 2,
    "& svg": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#FFF",
      color: "#339EDA",
      border: "2px solid #339EDA",
      borderRadius: "50%",
      padding: "2px",
    },
    "&:hover": {
      background: "rgba(132, 132, 132, 0.1)",
      "& svg": {
        background: "#F3F3F3",
      },
    },
  },
  infoButton: {
    position: "absolute",
    top: "-16px",
    right: "-16px",
    border: "none",
    borderRadius: "50%",
    background: "transparent",
    padding: "11px",
    marginRight: "3px",
    cursor: "pointer",
    zIndex: 2,
    "& svg": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#fff",
      color: "#339EDA",
      fontSize: "24px",
      borderRadius: "50%",
    },
    "&:hover": {
      background: "rgba(132, 132, 132, 0.1)",
      "& svg": {
        background: "#F3F3F3",
      },
    },
  },
  "transition-enter": {
    maxWidth: 0,
    opacity: 0,
  },
  "transition-enter-active": {
    maxWidth: "200px",
    opacity: 1,
    transitionTimingFunction: "linear",
    transitionDuration: "400ms",
    transitionProperty: "max-width, opacity",
    transitionDelay: "0s, 50ms",
  },
  executionList: {
    display: "flex",
    padding: 0,
    "& li": {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      zIndex: 2,
      "&:not(li:last-of-type)": {
        marginRight: "20px",
      },
    },
  },
  execution: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3px",
    border: "3px solid transparent",
    borderRadius: "50%",
  },
  executionScore: {
    width: "50px",
    height: "50px",
    margin: 0,
    padding: 0,
    background: "transparent",
    borderRadius: "50%",
    border: "none",
  },
  executionIndex: {
    position: "absolute",
    bottom: "-24px",
    margin: 0,
    color: "#BFBFBF",
    fontSize: "15px",
    fontWeight: 600,
  },
  activeLabel: {
    display: "none",
    position: "absolute",
    bottom: "-8px",
    padding: "2px 10px",
    background: "#339EDA",
    color: "#FFF",
    border: "2px solid #FFF",
    borderRadius: "15px",
    fontSize: "12px",
    "&.active": {
      display: "box",
    },
  },
  currentExecution: {
    border: `3px solid #339EDA`,
    padding: 0,
    "& > button[aria-label=select]": {
      boxSizing: "content-box",
      border: "3px solid #FFF",
    },
  },
}));

type Props = {
  executions: ExposedExecution[];
  activeExecution: ExposedExecution;
  onSelected: (id: string) => void;
};

export default function ExecutionList({
  executions,
  activeExecution,
  onSelected,
}: Props) {
  const classes = useStyles();
  const { currentExecution } = useLabContext();

  const sortedExecutions = useMemo(
    () =>
      executions
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()
        ),
    [executions]
  );

  const activeExecutionIndex = useMemo(
    () => sortedExecutions.map((item) => item.id).indexOf(activeExecution.id),
    [sortedExecutions, activeExecution]
  );

  const [renderedExecutions, setRenderedExecutions] = useState(
    sortedExecutions.slice(activeExecutionIndex, activeExecutionIndex + 3)
  );
  const renderedActiveExecutionIndex = useMemo(
    () => renderedExecutions.map((item) => item.id).indexOf(activeExecution.id),
    [renderedExecutions, activeExecution]
  );

  const [hoveredExecutionId, setHoveredExecutionId] = useState<string | null>(
    null
  );
  const [popperAnchorEl, setPopperAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const [
    popperExecution,
    setPopperExecution,
  ] = useState<ExposedExecution | null>(null);
  const popperElRef = useRef<HTMLDivElement>(null);

  const allLeftExecutionsLoaded =
    renderedExecutions.slice(0, renderedActiveExecutionIndex).length ===
    sortedExecutions.slice(0, activeExecutionIndex).length;
  const allRightExecutionsLoaded =
    renderedExecutions.slice(renderedActiveExecutionIndex).length ===
    sortedExecutions.slice(activeExecutionIndex).length;

  const handleInfoButtonClick = (
    e: React.MouseEvent,
    execution: ExposedExecution
  ) => {
    setHoveredExecutionId(null);
    setPopperExecution(execution);
    setPopperAnchorEl(e.currentTarget.parentElement);
  };

  const loadMore = (direction: string) => {
    const currentStartIndex = sortedExecutions
      .map((item) => item.id)
      .indexOf(renderedExecutions[0].id);
    const currentEndIndex = sortedExecutions
      .map((item) => item.id)
      .indexOf(renderedExecutions[renderedExecutions.length - 1].id);
    if (direction === "left") {
      const startIndex = currentStartIndex - 9 > 0 ? currentStartIndex - 9 : 0;
      setRenderedExecutions(
        sortedExecutions.slice(startIndex, currentEndIndex + 1)
      );
    } else if (direction === "right") {
      const endIndex =
        currentEndIndex + 9 < sortedExecutions.length - 1
          ? currentEndIndex + 9
          : sortedExecutions.length - 1;
      setRenderedExecutions(
        sortedExecutions.slice(currentStartIndex, endIndex + 1)
      );
    }
  };

  return (
    <div className={classes.root}>
      <div>
        {!allLeftExecutionsLoaded && (
          <Tooltip
            title="Load previous executions"
            placement="right"
            classes={{
              tooltip: classes.customTooltip,
            }}
          >
            <button
              className={classes.viewMoreButton}
              onClick={() => loadMore("left")}
            >
              <ArrowBackIcon />
            </button>
          </Tooltip>
        )}
        <TransitionGroup component="ul" className={classes.executionList}>
          {renderedExecutions.map((item) => (
            <CSSTransition
              key={item.id}
              timeout={500}
              classNames={{
                enter: classes["transition-enter"],
                enterActive: classes["transition-enter-active"],
              }}
            >
              <li>
                <div
                  className={classnames(classes.execution, {
                    [classes.currentExecution]:
                      currentExecution?.id === item.id,
                  })}
                  onMouseEnter={() =>
                    !popperAnchorEl && setHoveredExecutionId(item.id)
                  }
                  onMouseLeave={() =>
                    !popperAnchorEl && setHoveredExecutionId(null)
                  }
                >
                  <Zoom in={hoveredExecutionId === item.id} timeout={175}>
                    <button
                      className={classes.infoButton}
                      onClick={(e) => handleInfoButtonClick(e, item)}
                    >
                      <InfoIcon />
                    </button>
                  </Zoom>
                  <button
                    className={classes.executionScore}
                    onClick={() => onSelected(item.id)}
                    aria-label="select"
                  >
                    <ExecutionScore
                      score={Math.round(item.combinedScore * 100)}
                    />
                  </button>
                  <div
                    className={classnames(classes.activeLabel, {
                      active: activeExecution.id === item.id,
                    })}
                  >
                    Active
                  </div>
                </div>
                <p className={classes.executionIndex}>
                  {sortedExecutions.map((item) => item.id).indexOf(item.id) + 1}
                </p>
              </li>
            </CSSTransition>
          ))}
        </TransitionGroup>
        {!allRightExecutionsLoaded && (
          <Tooltip
            title="Load next executions"
            placement="right"
            classes={{
              tooltip: classes.customTooltip,
            }}
          >
            <button
              className={classes.viewMoreButton}
              onClick={() => loadMore("right")}
            >
              <ArrowForwardIcon />
            </button>
          </Tooltip>
        )}
        <Popper
          ref={popperElRef}
          open={Boolean(popperAnchorEl)}
          anchorEl={popperAnchorEl}
          placement="right-start"
          transition
          style={{ zIndex: 4 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={175}>
              <div>
                <ClickAwayListener onClickAway={() => setPopperAnchorEl(null)}>
                  <div>
                    <ExecutionDetails
                      anchorEl={popperAnchorEl}
                      floatingElRef={popperElRef}
                      execution={popperExecution}
                    />
                  </div>
                </ClickAwayListener>
              </div>
            </Fade>
          )}
        </Popper>
        <div className={classes.dividers}>
          {renderedExecutions.map((item, index) => (
            <div
              key={item.id}
              className={classnames(classes.divider, {
                [classes.dottedDivider]:
                  (!allLeftExecutionsLoaded && !index) ||
                  (!allRightExecutionsLoaded &&
                    index === renderedExecutions.length - 1),
              })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
