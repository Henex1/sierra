import React from "react";
import { Alert } from "@material-ui/lab";

type AlertProps = {
  message: string;
  onClose?: () => void;
};

export const ErrorAlert = ({ message, onClose }: AlertProps) => (
  <Alert severity="error" onClose={onClose}>
    {message}
  </Alert>
);

export const SuccessAlert = ({ message, onClose }: AlertProps) => (
  <Alert severity="success" onClose={onClose}>
    {message}
  </Alert>
);
