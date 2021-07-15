import React from "react";
import { makeStyles } from "@material-ui/core";
import classnames from "classnames";

import ExecutionScore from "../lab/ExecutionScore";
import { ExposedExecution } from "../../lib/execution";

const useStyles = makeStyles((theme) => ({
  list: {
    display: "flex",
    flexWrap: "wrap",
  },
  item: {
    margin: 0,
    padding: 0,
    background: "transparent",
    borderRadius: "50%",
    border: "5px solid transparent",
    cursor: "pointer",
  },
  current: {
    border: `5px solid ${theme.palette.primary.main}`,
  },
  active: {
    border: `5px solid ${theme.palette.error.main}`,
  },
}));

type Props = {
  executions: ExposedExecution[];
  activeExecution: ExposedExecution;
  currentExecution: ExposedExecution;
  onSelected: (id: string) => void;
};

export default function ExecutionList({
  executions,
  activeExecution,
  currentExecution,
  onSelected,
}: Props) {
  const classes = useStyles();
  const sortedExecutions = executions
    .slice()
    .sort(
      (a, b) =>
        new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()
    );

  return (
    <div className={classes.list}>
      {sortedExecutions.map((item) => {
        const isActive = activeExecution.id === item.id;
        const isCurrent = currentExecution.id === item.id;
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
          tooltip = [...tooltip, <br key="br" />, "currently being deployed"];
        } else if (isCurrent) {
          tooltip = [...tooltip, <br key="br" />, "currently being selected"];
        }

        return (
          <button
            key={item.id}
            className={classnames(classes.item, {
              [classes.current]: isCurrent,
              [classes.active]: isActive,
            })}
            onClick={() => onSelected(item.id)}
            aria-label="select"
          >
            <ExecutionScore
              score={Math.round(item.combinedScore * 100)}
              tooltip={<React.Fragment>{tooltip}</React.Fragment>}
            />
          </button>
        );
      })}
    </div>
  );
}
