import React from "react";
import { useRouter } from "next/router";
import { AppTopBarBanner } from "./AppTopBarBanner";
import { useLabContext } from "../../utils/react/hooks/useLabContext";

export const AppTopBarOutdatedExecution = () => {
  const { isExecutionDirty } = useLabContext();
  const { pathname } = useRouter();

  if (!isExecutionDirty || pathname !== "/[projectId]/lab") return null;

  return (
    <AppTopBarBanner variant="warning">
      This execution is stale. Some judgements and scores might not be up to
      date.
    </AppTopBarBanner>
  );
};
