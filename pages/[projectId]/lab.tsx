import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Grid, Typography, Box, makeStyles } from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import Router, { useRouter } from "next/router";

import { apiRequest } from "../../lib/api";
import Filters from "../../components/lab/Filters";
import SearchPhraseList from "../../components/lab/SearchPhraseList";
import { ResultList } from "../../components/lab/ResultList";
import ActionButtons from "../../components/lab/ActionButtons";
import ExecutionSummary from "../../components/lab/ExecutionSummary";
import { getProject } from "../../lib/projects";
import {
  getActiveSearchConfiguration,
  formatSearchConfiguration,
  ExposedSearchConfiguration,
} from "../../lib/searchconfigurations";
import {
  getExecution,
  getLatestExecution,
  listExecutions,
  countSearchPhrases,
  getSearchPhrases,
  ExposedExecution,
  formatExecution,
} from "../../lib/execution";
import { ExposedSearchPhrase, ShowOptions, SortOptions } from "../../lib/lab";
import {
  authenticatedPage,
  requireParam,
  optionalNumberQuery,
} from "../../lib/pageHelpers";
import {
  listRulesets,
  listRulesetVersions,
  formatRuleset,
  ExposedRulesetWithVersions,
  formatRulesetVersion,
  ExposedRulesetVersion,
  getRulesetsForSearchConfiguration,
} from "../../lib/rulesets";
import {
  QueryTemplate,
  getQueryTemplate,
  listQueryTemplates,
  ExposedQueryTemplate,
  formatQueryTemplate,
} from "../../lib/querytemplates";
import { getSearchEndpoint } from "../../lib/searchendpoints";
import NoExistingExcution from "components/lab/NoExistingExcution";
import { BackdropLoadingSpinner } from "../../components/common/BackdropLoadingSpinner";

const useStyles = makeStyles((theme) => ({
  listContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4),
  },
  listBorder: {
    borderRight: "1px solid rgba(0, 0, 0, 0.08)",
  },
}));

const pageSize = 10;

type Props = {
  searchConfiguration:
    | (ExposedSearchConfiguration & {
        queryTemplate: ExposedQueryTemplate;
        rulesets: ExposedRulesetVersion[];
      })
    | null;
  searchPhrases: ExposedSearchPhrase[];
  searchPhrasesTotal: number;
  rulesets: ExposedRulesetWithVersions[];
  templates: ExposedQueryTemplate[];
  executions: ExposedExecution[];
  activeExecution: ExposedExecution | null; // execution being deployed
  currentExecution: ExposedExecution | null; // execution being viewed/selected
  displayOptions: {
    show: ShowOptions;
    sort: SortOptions;
  };
  page: number;
  displayFields: Array<string>;
};

export const getServerSideProps = authenticatedPage<Props>(async (context) => {
  const projectId = requireParam(context, "projectId");
  const project = await getProject(context.user, projectId);
  if (!project) {
    return { notFound: true };
  }
  const page = optionalNumberQuery(context, "page", 1) - 1;
  const sc = await getActiveSearchConfiguration(project);
  const currentExecutionId = context.query.execution;
  const currentExecution = currentExecutionId
    ? await getExecution(context.user, currentExecutionId as string)
    : sc
    ? await getLatestExecution(sc)
    : null;
  const searchPhrasesTotal = currentExecution
    ? await countSearchPhrases(currentExecution)
    : 0;
  const displayOptions = {
    show: (context.query.show as ShowOptions) || "all",
    sort: (context.query.sort as SortOptions) || "score-desc",
  };
  const searchPhrases = currentExecution
    ? await getSearchPhrases(currentExecution, {
        skip: pageSize * page,
        take: pageSize,
        filter: displayOptions.show,
        sort: displayOptions.sort,
      })
    : [];
  const formattedPhrases: ExposedSearchPhrase[] = searchPhrases.map(
    (phrase): ExposedSearchPhrase => {
      switch (phrase.error) {
        case null:
          return {
            __type: "ScoredSearchPhraseExecution",
            id: phrase.id,
            phrase: phrase.phrase,
            combinedScore: _.isNumber(phrase.combinedScore)
              ? phrase.combinedScore * 100
              : null,
            allScores: phrase.allScores
              ? _.mapValues(
                  phrase.allScores as Record<string, number>,
                  (s) => s * 100
                )
              : null,
            results: phrase.totalResults,
            tookMs: phrase.tookMs,
          };
        default:
          return {
            __type: "FailedSearchPhraseExecution",
            id: phrase.id,
            phrase: phrase.phrase,
            error: phrase.error,
          };
      }
    }
  );
  const queryTemplate = sc
    ? await getQueryTemplate(context.user, sc.queryTemplateId)
    : null;
  const searchConfiguration = sc
    ? {
        ...formatSearchConfiguration(sc),
        rulesets: (await getRulesetsForSearchConfiguration(sc)).map(
          formatRulesetVersion
        ),
        queryTemplate: formatQueryTemplate(queryTemplate as QueryTemplate),
      }
    : null;
  const templates = await listQueryTemplates(project);
  const rulesets = await listRulesets(context.user);
  const rulesetVersions = await Promise.all(
    rulesets.map((ruleset) => listRulesetVersions(ruleset))
  );
  const rulesetsWithVersions: ExposedRulesetWithVersions[] = rulesets.map(
    (ruleset, i) => ({
      ...formatRuleset(ruleset),
      rulesetVersions: rulesetVersions[i].map(formatRulesetVersion),
    })
  );
  const executions = sc ? await listExecutions(sc) : [];

  const searchEndpoint = await getSearchEndpoint(
    context.user,
    project.searchEndpointId!
  );

  return {
    props: {
      searchConfiguration,
      searchPhrases: formattedPhrases,
      searchPhrasesTotal,
      rulesets: rulesetsWithVersions,
      templates: templates.map(formatQueryTemplate),
      executions: executions.map(formatExecution),
      // TODO: actual active execution
      // currently it's just using the latest execution
      activeExecution: executions.length
        ? formatExecution(executions[0])
        : null,
      currentExecution: currentExecution
        ? formatExecution(currentExecution)
        : null,
      displayOptions,
      page: page + 1,
      displayFields: searchEndpoint?.displayFields || [],
    },
  };
});

export default function Lab({
  searchConfiguration,
  searchPhrases,
  searchPhrasesTotal,
  rulesets,
  templates,
  activeExecution,
  currentExecution,
  executions,
  displayFields,
  ...props
}: Props) {
  const classes = useStyles();
  const router = useRouter();
  const [propsLoading, setPropsLoading] = useState(false);

  useEffect(() => {
    // Add backdrop with loading spinner while getting server side props
    const start = () => setPropsLoading(true);
    const end = () => setPropsLoading(false);

    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);

    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, []);

  const [
    activeSearchPhrase,
    setActiveSearchPhrase,
  ] = React.useState<ExposedSearchPhrase | null>(null);
  const [displayOptions, setDisplayOptions] = React.useState<
    Props["displayOptions"]
  >({
    show: props.displayOptions.show,
    sort: props.displayOptions.sort,
  });
  const [currentExecutionId, setCurrentExecutionId] = React.useState<
    string | null
  >(null);
  const [page, setPage] = React.useState(props.page);
  const [isTestRunning, setIsTestRunning] = React.useState(false);
  const searchConfigurationId = searchConfiguration?.id;

  React.useEffect(() => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        show: displayOptions.show,
        sort: displayOptions.sort,
        execution: currentExecutionId,
        page,
      },
    });
  }, [displayOptions, page, currentExecutionId]);

  const handleFilterChange = useCallback(
    (key: "show" | "sort", value: ShowOptions | SortOptions) => {
      handleModalClose();
      setDisplayOptions({
        ...displayOptions,
        [key]: value,
      });
    },
    []
  );

  const handleModalClose = useCallback(() => setActiveSearchPhrase(null), []);

  const handleRun = useCallback(async () => {
    if (searchConfigurationId) {
      setIsTestRunning(true);
      await apiRequest("/api/searchconfigurations/execute", {
        id: searchConfigurationId,
      });
      location.reload();
    }
  }, [searchConfigurationId]);

  const isFirstQueryExcute = searchPhrases.length == 0;

  return (
    <>
      <BackdropLoadingSpinner open={propsLoading} />
      <div>
        {!!searchConfiguration && !isFirstQueryExcute ? (
          <div>
            <Grid container spacing={4} className={classes.listContainer}>
              <Grid item sm={4} className={classes.listBorder}>
                <Box>
                  <Box mb={2}>
                    <Typography>
                      Showing {searchPhrasesTotal} search phrases
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Filters
                      filters={displayOptions}
                      onFilterChange={handleFilterChange}
                    />
                  </Box>
                </Box>
                <SearchPhraseList
                  searchPhrases={searchPhrases}
                  activePhrase={activeSearchPhrase}
                  setActivePhrase={setActiveSearchPhrase}
                />
                <Box mt={4} display="flex" justifyContent="center">
                  <Pagination
                    page={page}
                    count={Math.ceil(searchPhrasesTotal / pageSize)}
                    onChange={(e: React.ChangeEvent<unknown>, value: number) =>
                      setPage(value)
                    }
                  />
                </Box>
              </Grid>
              <Grid item md={8}>
                {activeSearchPhrase ? (
                  <ResultList
                    searchPhrase={activeSearchPhrase}
                    onClose={handleModalClose}
                    displayFields={displayFields}
                  />
                ) : (
                  <Box>
                    {activeExecution && currentExecution && (
                      <ExecutionSummary
                        templates={templates}
                        rulesets={rulesets}
                        executions={executions}
                        activeExecution={activeExecution}
                        currentExecution={currentExecution}
                        onSelected={(id: string) => setCurrentExecutionId(id)}
                      />
                    )}
                  </Box>
                )}
              </Grid>
            </Grid>
          </div>
        ) : (
          <NoExistingExcution
            isSearchConfig={!!searchConfiguration}
            isRunQuery={isFirstQueryExcute}
          />
        )}
        <ActionButtons
          searchConfiguration={searchConfiguration}
          rulesets={rulesets}
          canRun={searchConfiguration !== null}
          isRunning={isTestRunning}
          onRun={handleRun}
        />
      </div>
    </>
  );
}
