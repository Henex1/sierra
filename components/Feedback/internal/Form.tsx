import React, { FC } from "react";
import { useRatingStyles } from "./hooks";
import { Button, CircularProgress } from "@material-ui/core";
import { Space } from "./Space";

export interface Props {
  submitting: boolean;
  onSubmit: () => void;
}

/**
 * @internal
 */
// eslint-disable-next-line react/prop-types
export const Form: FC<Props> = ({ children, submitting, onSubmit }) => {
  const C = useRatingStyles();

  return (
    <div className={C.root}>
      {children}
      <Space />
      <span>
        <Button
          onClick={onSubmit}
          color={"primary"}
          variant={"contained"}
          disabled={submitting}
          endIcon={
            submitting ? (
              <CircularProgress size={12} color={"secondary"} />
            ) : undefined
          }
        >
          Submit
        </Button>
      </span>
    </div>
  );
};
