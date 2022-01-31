import React, { useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useRouter } from "next/router";
import classnames from "classnames";
import {
  CircularProgress,
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
import { apiRequest } from "../../lib/api";
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
  allExecutionsLength: number;
  activeExecution: ExposedExecution;
  onSelected: (id: string) => void;
};

export default function ExecutionList({
  executions: initialExecutions,
  allExecutionsLength,
  activeExecution,
  onSelected,
}: Props) {
  const classes = useStyles();
  const router = useRouter();
  const { currentExecution } = useLabContext();

  const [executions, setExecutions] = useState(initialExecutions);
  const [leftArrowIsLoading, setLeftArrowIsLoading] = useState(false);
  const [rightArrowIsLoading, setRightArrowIsLoading] = useState(false);
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

  const allLeftExecutionsLoaded = !executions[0].index;
  const allRightExecutionsLoaded =
    executions[executions.length - 1].index === allExecutionsLength - 1;

  const handleInfoButtonClick = (
    e: React.MouseEvent,
    execution: ExposedExecution
  ) => {
    setHoveredExecutionId(null);
    setPopperExecution(execution);
    setPopperAnchorEl(e.currentTarget.parentElement);
  };

  const loadMore = async (direction: "left" | "right") => {
    const refExecutionId =
      executions[{ left: 0, right: executions.length - 1 }[direction]].id;
    const setLoading = {
      left: setLeftArrowIsLoading,
      right: setRightArrowIsLoading,
    }[direction];
    setLoading(true);
    const loadedExecutions = await apiRequest(`/api/executions/load`, {
      projectId: router.query.projectId,
      refExecutionId,
      direction,
    });
    setLoading(false);
    setExecutions((executions) => [
      ...{ left: loadedExecutions, right: [] }[direction],
      ...executions,
      ...{ left: [], right: loadedExecutions }[direction],
    ]);
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
              {leftArrowIsLoading ? (
                <CircularProgress size={24} />
              ) : (
                <ArrowBackIcon />
              )}
            </button>
          </Tooltip>
        )}
        <TransitionGroup component="ul" className={classes.executionList}>
          {executions.map((item) => (
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
                <p className={classes.executionIndex}>{item.index + 1}</p>
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
              {rightArrowIsLoading ? (
                <CircularProgress size={24} />
              ) : (
                <ArrowForwardIcon />
              )}
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
          {executions.map((item, index) => (
            <div
              key={item.id}
              className={classnames(classes.divider, {
                [classes.dottedDivider]:
                  (!allLeftExecutionsLoaded && !index) ||
                  (!allRightExecutionsLoaded &&
                    index === executions.length - 1),
              })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
