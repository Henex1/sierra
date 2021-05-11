import React, { useState } from "react";
import { CircularProgress } from "@material-ui/core";

type BusyIndicator = {
  size: number;
};
function BusyIndicator({ size, ...rest }: BusyIndicator) {
  return <CircularProgress size={size} {...rest} />;
}

export default BusyIndicator;

BusyIndicator.defaultProps = {
  size: 24,
};

export const useBusyStatus = () => {
  return useState<boolean>(false);
};
