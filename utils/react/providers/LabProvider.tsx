import { createContext, useState } from "react";
import { Execution } from "@prisma/client";

export const LabContext = createContext({} as any);

type Props = {
  children: React.ReactElement;
};

export const LabProvider = ({ children }: Props) => {
  const [currentExecution, setCurrentExecution] = useState<Execution | null>(
    null
  );
  const [isExecutionDirty, setIsExecutionDirty] = useState(false);

  const context = {
    currentExecution,
    setCurrentExecution,
    isExecutionDirty,
    setIsExecutionDirty,
  };

  return <LabContext.Provider value={context}>{children}</LabContext.Provider>;
};
