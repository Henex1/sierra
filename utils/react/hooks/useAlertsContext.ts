import { useContext } from "react";
import { AlertsContext } from "../providers/AlertsProvider";

export const useAlertsContext = () => {
  const context = useContext(AlertsContext);

  if (!context) {
    throw new Error("Application should be wrapper with AlertsProvider");
  }

  return context;
};
