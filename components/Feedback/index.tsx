/* eslint-disable react/prop-types */
import React, { FC, useCallback } from "react";
import { Button, ButtonGroup, Card, CardContent } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { useFeedbackStyles } from "./internal/hooks";
import { Type } from "../AppTopBar/FeedbackMenu/types/Feedback";
import Alert from "@material-ui/lab/Alert";

export interface Props {
  type: Type;
  onChange: (type: Type) => void;
  onClose: () => void;
  error?: string;
}

export const Feedback: FC<Props> = ({
  type,
  onChange,
  onClose,
  children,
  error,
}) => {
  const C = useFeedbackStyles();
  const setRating = useCallback(() => onChange(Type.Rating), [onChange]);
  const setReport = useCallback(() => onChange(Type.Report), [onChange]);
  const setRequest = useCallback(() => onChange(Type.Request), [onChange]);

  return (
    <Card>
      <CardContent className={C.root}>
        <div className={C.title}>Product Feedback</div>
        <Close onClick={onClose} className={C.close} />
        <ButtonGroup
          color={"primary"}
          aria-label="contained primary button group"
          size={"small"}
          className={C.type}
        >
          <Button
            onClick={setRating}
            variant={type === "rating" ? "contained" : "outlined"}
          >
            Rating
          </Button>
          <Button
            onClick={setReport}
            variant={type === "report" ? "contained" : "outlined"}
          >
            Bug Report
          </Button>
          <Button
            onClick={setRequest}
            variant={type === "request" ? "contained" : "outlined"}
          >
            Request
          </Button>
        </ButtonGroup>
        {error && (
          <Alert severity="warning" className={C.error}>
            {error}
          </Alert>
        )}
        <div className={C.form}>{children}</div>
      </CardContent>
    </Card>
  );
};
