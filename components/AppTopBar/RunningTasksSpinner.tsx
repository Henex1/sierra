import React from "react";
import { Tooltip, CircularProgress } from "@material-ui/core";

export const RunningTasksSpinner = ({ tasks }: RunningTasksSpinnerProps) => {
  if (!tasks?.length) return null;

  return (
    <Tooltip
      title={
        <>
          <p>Running tasks:</p>
          {tasks.map((task, index) => (
            <p key={`${task}-${index}`}>{task}</p>
          ))}
        </>
      }
    >
      <CircularProgress
        color="primary"
        size={30}
        classes={{ colorPrimary: "#fff!important" }}
      />
    </Tooltip>
  );
};

type RunningTasksSpinnerProps = {
  tasks: Array<string>;
};
