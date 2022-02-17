import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
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
import { ExposedProject } from "../../../lib/projects";

export type LabContextSearchConfiguration =
  | (ExposedSearchConfiguration & {
      queryTemplate: ExposedQueryTemplate;
      rulesets: Array<ExposedRulesetVersion>;
    })
  | null;
interface LabProviderProps {
  children: JSX.Element | Array<JSX.Element>;
  project: ExposedProject;
  currentExecution: ExposedExecution | null;
  searchConfiguration: LabContextSearchConfiguration;
  searchConfigurations: Array<ExposedSearchConfiguration>;
  allSCsLength: number;
  rulesets: Array<ExposedRulesetWithVersions>;
  currentSearchConfigId: string | null;
  setCurrentSearchConfigId: (id: string) => void;
}

interface ILabContext {
  currentExecution: ExposedExecution | null;
  project: ExposedProject | null;
  searchConfiguration: LabContextSearchConfiguration;
  searchConfigurations: Array<ExposedSearchConfiguration>;
  currentSearchConfigId: string | null;
  setSearchConfigurations: (
    data:
      | Array<ExposedSearchConfiguration>
      | ((
          current: Array<ExposedSearchConfiguration>
        ) => Array<ExposedSearchConfiguration>)
  ) => void;
  allSCsLength: number;
  rulesets: Array<ExposedRulesetWithVersions>;
  isExecutionRunning: boolean;
  runningExecutionSCId: string | null;
  activeSearchPhrase: ExposedSearchPhrase | null;
  setActiveSearchPhrase: (value: ExposedSearchPhrase) => void;
  runExecution: (
    searchConfigurationId?: string,
    newSearchConfiguration?: ExposedSearchConfiguration
  ) => void;
  canRunExecution: boolean;
}

const defaultState = {
  activeSearchPhrase: null,
  isExecutionRunning: false,
  runningExecutionSCId: null,
  canRunExecution: false,
  searchConfiguration: null,
  currentSearchConfigId: null,
  searchConfigurations: [],
  setSearchConfigurations: () => {},
  allSCsLength: 0,
  currentExecution: null,
  project: null,
  rulesets: [],
  setActiveSearchPhrase: () => {},
  runExecution: () => {},
};

export const LabContext = createContext<ILabContext>(defaultState);

export const LabProvider = ({
  children,
  project,
  currentExecution,
  searchConfiguration,
  searchConfigurations: initialSCs,
  allSCsLength: initialAllSCsLength,
  rulesets,
  currentSearchConfigId,
  setCurrentSearchConfigId,
}: LabProviderProps) => {
  const [
    activeSearchPhrase,
    setActiveSearchPhrase,
  ] = useState<ExposedSearchPhrase | null>(null);
  const [searchConfigurations, setSearchConfigurations] = useState(initialSCs);
  const [allSCsLength, setAllSCsLength] = useState(initialAllSCsLength);
  const [isExecutionRunning, setIsExecutionRunning] = useState(false);
  const [runningExecutionSCId, setRunningExecutionSCId] = useState<
    string | null
  >(null);
  const { addErrorAlert } = useAlertsContext();

  useEffect(() => {
    const socket = io();
    socket.on("running_tasks", ({ tasks }: { tasks: Array<string> }) => {
      if (
        tasks.some((task) => task.includes("Search Configuration Execution")) &&
        !isExecutionRunning
      ) {
        setIsExecutionRunning(true);
      }
    });
  }, []);

  if (!searchConfiguration) return <>{children}</>;

  const runExecution = async (
    searchConfigurationId?: string,
    newSearchConfiguration?: ExposedSearchConfiguration
  ) => {
    if (!searchConfigurationId) return;

    if (newSearchConfiguration) {
      setSearchConfigurations((searchConfigurations) => [
        ...searchConfigurations,
        newSearchConfiguration,
      ]);
      setAllSCsLength((allSCsLength) => allSCsLength + 1);
    }

    setIsExecutionRunning(true);
    setRunningExecutionSCId(searchConfigurationId);

    try {
      await apiRequest("/api/searchconfigurations/execute", {
        id: searchConfigurationId,
      });

      const updatedSearchConfiguration: ExposedSearchConfiguration = await apiRequest(
        `/api/searchconfigurations/load/${searchConfigurationId}`,
        {
          index:
            newSearchConfiguration?.index ??
            searchConfigurations.find((sc) => sc.id === searchConfigurationId)
              ?.index,
        }
      );

      setSearchConfigurations((searchConfigurations) =>
        searchConfigurations.map((sc) =>
          sc.id === searchConfigurationId ? updatedSearchConfiguration : sc
        )
      );
    } catch (err) {
      addErrorAlert(err);
    } finally {
      setIsExecutionRunning(false);
      setRunningExecutionSCId(null);
    }
    setCurrentSearchConfigId(searchConfigurationId);
  };

  const context = {
    activeSearchPhrase,
    setActiveSearchPhrase,
    currentExecution,
    project,
    searchConfiguration,
    currentSearchConfigId,
    searchConfigurations,
    setSearchConfigurations,
    allSCsLength,
    rulesets,
    runExecution,
    isExecutionRunning,
    runningExecutionSCId,
    canRunExecution: Boolean(searchConfiguration),
  };

  return <LabContext.Provider value={context}>{children}</LabContext.Provider>;
};
