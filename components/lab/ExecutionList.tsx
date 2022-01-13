import React, { useMemo, useState } from "react";
import classnames from "classnames";
import { makeStyles, Tooltip } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import ExecutionScore from "../lab/ExecutionScore";
import { ExposedExecution } from "../../lib/execution";
import { useLabContext } from "../../utils/react/hooks/useLabContext";

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
  viewMoreButton: {
    border: "none",
    borderRadius: "50%",
    background: "transparent",
    padding: "11px",
    marginRight: "3px",
    cursor: "pointer",
    zIndex: 2,
    "&:hover": {
      background: "rgba(132, 132, 132, 0.1)",
      "& svg": {
        background: "#F3F3F3",
      },
    },
  },
  viewMoreIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff",
    color: "#339EDA",
    border: "2px solid #339EDA",
    borderRadius: "50%",
    padding: "2px",
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
  list: {
    display: "flex",
    padding: 0,
  },
  itemContainer: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 2,
    "&:not(li:last-of-type)": {
      marginRight: "20px",
    },
  },
  itemDetails: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3px",
    border: "3px solid transparent",
    borderRadius: "50%",
  },
  item: {
    width: "50px",
    height: "50px",
    margin: 0,
    padding: 0,
    background: "transparent",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
  },
  itemOrder: {
    position: "absolute",
    bottom: "-24px",
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
    color: "#fff",
    border: "2px solid #fff",
    borderRadius: "15px",
    fontSize: "12px",
  },
  active: {
    display: "box",
  },
  current: {
    border: `3px solid #339EDA`,
    padding: 0,
    "& button": {
      boxSizing: "content-box",
      border: "3px solid #fff",
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
  const { currentExecution } = useLabContext();
  const classes = useStyles();
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
  const [renderedExecutions, setRenderedExecutions] = useState(
    sortedExecutions.filter((item) => activeExecution.id === item.id)
  );

  const allExecutionsLoaded =
    renderedExecutions.length === sortedExecutions.length;

  const loadMore = () => {
    const currentStartIndex = sortedExecutions
      .map((item) => item.id)
      .indexOf(renderedExecutions[0].id);
    const startIndex = currentStartIndex - 9 > 0 ? currentStartIndex - 9 : 0;
    setRenderedExecutions(sortedExecutions.slice(startIndex));
  };

  return (
    <div className={classes.root}>
      <div>
        {!allExecutionsLoaded && (
          <Tooltip
            title="Load previous executions"
            placement="right"
            classes={{
              tooltip: classes.customTooltip,
            }}
          >
            <button className={classes.viewMoreButton} onClick={loadMore}>
              <ArrowBackIcon classes={{ root: classes.viewMoreIcon }} />
            </button>
          </Tooltip>
        )}
        <ul className={classes.list}>
          {renderedExecutions.map((item) => {
            const isActive = activeExecution.id === item.id;
            const isCurrent = currentExecution?.id === item.id;
            let tooltip: React.ReactNode[] = [
              `${new Date(item.createdAt).toLocaleDateString()} ${new Date(
                item.createdAt
              ).toLocaleTimeString()}`,
            ];
            if (isActive && isCurrent) {
              tooltip = [
                ...tooltip,
                <br key="br" />,
                "currently being deployed and selected",
              ];
            } else if (isActive) {
              tooltip = [
                ...tooltip,
                <br key="br" />,
                "currently being deployed",
              ];
            } else if (isCurrent) {
              tooltip = [
                ...tooltip,
                <br key="br" />,
                "currently being selected",
              ];
            }

            return (
              <li key={item.id} className={classes.itemContainer}>
                <div
                  className={classnames(classes.itemDetails, {
                    [classes.current]: isCurrent,
                  })}
                >
                  <button
                    className={classes.item}
                    onClick={() => onSelected(item.id)}
                    aria-label="select"
                  >
                    <ExecutionScore
                      score={Math.round(item.combinedScore * 100)}
                      tooltip={<React.Fragment>{tooltip}</React.Fragment>}
                    />
                  </button>
                  <div
                    className={classnames(classes.activeLabel, {
                      [classes.active]: isActive,
                    })}
                  >
                    Active
                  </div>
                </div>
                <div className={classes.itemOrder}>
                  {sortedExecutions.map((item) => item.id).indexOf(item.id) + 1}
                </div>
              </li>
            );
          })}
        </ul>
        <div className={classes.dividers}>
          {!allExecutionsLoaded
            ? renderedExecutions.map((item, index) => (
                <div
                  key={item.id}
                  className={classnames(classes.divider, {
                    [classes.dottedDivider]: !index,
                  })}
                />
              ))
            : renderedExecutions.map((item) => (
                <div key={item.id} className={classes.divider} />
              ))}
        </div>
      </div>
    </div>
  );
}
