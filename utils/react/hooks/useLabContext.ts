import { useContext } from "react";
import { LabContext } from "../providers/LabProvider";

export const useLabContext = () => {
  const context = useContext(LabContext);

  if (!context) {
    throw new Error("This page should be wrapper with LabProvider");
  }

  return context;
};
