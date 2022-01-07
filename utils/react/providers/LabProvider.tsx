import { createContext, useState } from "react";
import { ExposedSearchPhrase } from "../../../lib/lab";
import { ExposedSearchConfiguration } from "../../../lib/searchconfigurations";
import { ExposedExecution } from "../../../lib/execution";
import {
  ExposedRulesetVersion,
  ExposedRulesetWithVersions,
} from "../../../lib/rulesets";
import { apiRequest } from "../../../lib/api";
import { useAlertsContext } from "../hooks/useAlertsContext";
import { ExposedQueryTemplate } from "../../../lib/querytemplates";

type LabContextSearchConfiguration =
  | (ExposedSearchConfiguration & {
      queryTemplate: ExposedQueryTemplate;
      rulesets: Array<ExposedRulesetVersion>;
    })
  | null;
interface LabProviderProps {
  children: JSX.Element | Array<JSX.Element>;
  currentExecution: ExposedExecution | null;
  searchConfiguration: LabContextSearchConfiguration;
  rulesets: Array<ExposedRulesetWithVersions>;
}

interface ILabContext {
  currentExecution: ExposedExecution | null;
  searchConfiguration: LabContextSearchConfiguration;
  rulesets: Array<ExposedRulesetWithVersions>;
  isExecutionRunning: boolean;
  activeSearchPhrase: ExposedSearchPhrase | null;
  setActiveSearchPhrase: (value: ExposedSearchPhrase) => void;
  runExecution: (value: string) => void;
  canRunExecution: boolean;
}

const defaultState = {
  activeSearchPhrase: null,
  isExecutionRunning: false,
  canRunExecution: false,
  searchConfiguration: null,
  currentExecution: null,
  rulesets: [],
  setActiveSearchPhrase: () => {},
  runExecution: () => {},
};

export const LabContext = createContext<ILabContext>(defaultState);

export const LabProvider = ({
  children,
  currentExecution,
  searchConfiguration,
  rulesets,
}: LabProviderProps) => {
  const [
    activeSearchPhrase,
    setActiveSearchPhrase,
  ] = useState<ExposedSearchPhrase | null>(null);
  const [isExecutionRunning, setIsExecutionRunning] = useState(false);
  const { addErrorAlert } = useAlertsContext();

  if (!currentExecution || !searchConfiguration) return <>{children}</>;

  const runExecution = async (queryTemplateId: string) => {
    const searchConfigurationId = searchConfiguration.id;
    if (!searchConfigurationId) return;

    setIsExecutionRunning(true);

    try {
      await apiRequest("/api/searchconfigurations/update", {
        id: searchConfigurationId,
        queryTemplateId,
        executionId: currentExecution?.id,
      });

      await apiRequest("/api/searchconfigurations/execute", {
        id: searchConfigurationId,
      });

      setIsExecutionRunning(false);
      location.reload();
    } catch (err) {
      addErrorAlert(err);
      setIsExecutionRunning(false);
    }
  };

  const context = {
    activeSearchPhrase,
    setActiveSearchPhrase,
    currentExecution,
    searchConfiguration,
    rulesets,
    runExecution,
    isExecutionRunning,
    canRunExecution: Boolean(searchConfiguration),
  };

  return <LabContext.Provider value={context}>{children}</LabContext.Provider>;
};
