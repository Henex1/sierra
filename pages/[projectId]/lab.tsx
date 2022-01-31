import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Grid, Typography, Box, makeStyles } from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import Router, { useRouter } from "next/router";
import { isAfter } from "date-fns";
import Filters, { Props as FiltersProps } from "../../components/lab/Filters";
import SearchPhraseList from "../../components/lab/SearchPhraseList";
import { ResultList } from "../../components/lab/ResultList";
import Configuration from "../../components/lab/Configuration";
import ExecutionSummary from "../../components/lab/ExecutionSummary";
import { getProject, updateProject } from "../../lib/projects";
import {
  formatSearchConfiguration,
  ExposedSearchConfiguration,
  getActiveSearchConfiguration,
} from "../../lib/searchconfigurations";
import {
  listExecutions,
  countSearchPhrases,
  getSearchPhrases,
  ExposedExecution,
  formatExecution,
  getLatestExecution,
  getCurrentExecution,
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
import NoExistingExecution from "components/lab/NoExistingExecution";
import { listJudgements } from "../../lib/judgements";
import { BackdropLoadingSpinner } from "../../components/common/BackdropLoadingSpinner";
import { LabProvider } from "../../utils/react/providers/LabProvider";
import { useAppTopBarBannerContext } from "../../utils/react/hooks/useAppTopBarBannerContext";
import { AppTopBarBannerVariant } from "../../utils/react/providers/AppTopBarBannerProvider";

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
  searchPhrases: ExposedSearchPhrase[] | null;
  searchPhrasesTotal: number;
  rulesets: ExposedRulesetWithVersions[];
  templates: ExposedQueryTemplate[];
  executions: ExposedExecution[];
  activeExecution: ExposedExecution | null; // execution being deployed
  currentExecution: ExposedExecution | null; // execution being viewed/selected
  displayOptions: {
    show: ShowOptions;
    sort: SortOptions;
    search: string;
  };
  page: number;
  displayFields: Array<string>;
  searchEndpointType: string;
  isExecutionDirty: boolean;
};

export const getServerSideProps = authenticatedPage<Props>(async (context) => {
  const projectId = requireParam(context, "projectId");
  const project = await getProject(context.user, projectId);
  if (!project) {
    return { notFound: true };
  }

  const searchEndpoint = await getSearchEndpoint(
    context.user,
    project.searchEndpointId
  );
  if (!searchEndpoint) {
    return { notFound: true };
  }

  const page = optionalNumberQuery(context, "page", 1) - 1;

  // Get all executions for selected project
  const executions = projectId ? await listExecutions(projectId) : [];

  // Query parameters
  const {
    execution: currentExecutionId,
    show = "all",
    sort = "score-desc",
    search = "",
  } = context.query;

  // Get current search configuration
  let currentSearchConfiguration = await getActiveSearchConfiguration(
    project,
    currentExecutionId as string
  );

  // Get active search configuration
  let activeSearchConfiguration = await getActiveSearchConfiguration(project);

  // Current execution
  let currentExecution = await getCurrentExecution(
    context.user,
    currentSearchConfiguration,
    currentExecutionId as string
  );

  // Active execution
  let activeExecution =
    activeSearchConfiguration &&
    (await getLatestExecution(activeSearchConfiguration));

  if (!activeExecution) {
    // Temp hack - lab's execution list should be refactored
    const updatedProject = await updateProject(
      context.user,
      project,
      searchEndpoint,
      {
        activeSearchConfigurationId: (
          await getLatestExecution(undefined, project)
        )?.searchConfigurationId,
      }
    );

    // Get current search configuration
    currentSearchConfiguration = await getActiveSearchConfiguration(
      updatedProject,
      currentExecutionId as string
    );

    // Get active search configuration
    activeSearchConfiguration = await getActiveSearchConfiguration(
      updatedProject
    );

    // Current execution
    currentExecution = await getCurrentExecution(
      context.user,
      currentSearchConfiguration,
      currentExecutionId as string
    );

    // Active execution
    activeExecution =
      activeSearchConfiguration &&
      (await getLatestExecution(activeSearchConfiguration));
  }

  const judgements = await listJudgements(project);
  const isExecutionDirty = currentExecution
    ? judgements.find((judgement) =>
        isAfter(
          new Date(judgement.updatedAt),
          new Date(currentExecution!.createdAt)
        )
      )
    : false;

  const searchPhrasesTotal = currentExecution
    ? await countSearchPhrases(
        currentExecution,
        show as ShowOptions,
        (search as string) ?? ""
      )
    : 0;
  const displayOptions = {
    show: show as ShowOptions,
    sort: sort as SortOptions,
    search: search as string,
  };
  const searchPhrases = currentExecution
    ? await getSearchPhrases(currentExecution, {
        skip: pageSize * page,
        take: pageSize,
        filter: displayOptions.show,
        sort: displayOptions.sort,
        search: displayOptions.search,
      })
    : null;
  const formattedPhrases: ExposedSearchPhrase[] | null = searchPhrases
    ? searchPhrases.map(
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
      )
    : null;
  const queryTemplate = currentSearchConfiguration
    ? await getQueryTemplate(
        context.user,
        currentSearchConfiguration.queryTemplateId
      )
    : null;
  const searchConfiguration = currentSearchConfiguration
    ? {
        ...formatSearchConfiguration(
          currentSearchConfiguration,
          searchEndpoint.type
        ),
        rulesets: (
          await getRulesetsForSearchConfiguration(currentSearchConfiguration)
        ).map(formatRulesetVersion),
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

  return {
    props: {
      searchConfiguration,
      searchPhrases: formattedPhrases || null,
      searchPhrasesTotal,
      rulesets: rulesetsWithVersions,
      templates: templates.map(formatQueryTemplate),
      executions: executions.map(formatExecution),
      activeExecution: activeExecution
        ? formatExecution(activeExecution)
        : null,
      currentExecution: currentExecution
        ? formatExecution(currentExecution)
        : null,
      displayOptions,
      page: page + 1,
      displayFields: searchEndpoint.displayFields,
      searchEndpointType: searchEndpoint.type,
      isExecutionDirty: Boolean(isExecutionDirty),
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
  searchEndpointType,
  displayFields,
  isExecutionDirty,
  ...props
}: Props) {
  const classes = useStyles();
  const router = useRouter();
  const [propsLoading, setPropsLoading] = useState(false);
  const { setBanner } = useAppTopBarBannerContext();

  useEffect(() => {
    if (isExecutionDirty) {
      setBanner({
        variant: AppTopBarBannerVariant.Warning,
        message:
          "This execution is stale. Some judgements and scores might not be up to date.",
        pages: ["lab"],
      });
    }
  }, [isExecutionDirty]);

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
    search: props.displayOptions.search,
  });
  const [currentExecutionId, setCurrentExecutionId] = React.useState<
    string | null
  >(null);
  const [page, setPage] = React.useState(props.page);

  React.useEffect(() => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        show: displayOptions.show,
        sort: displayOptions.sort,
        search: displayOptions.search,
        execution: currentExecutionId,
        page,
      },
    });
  }, [displayOptions, page, currentExecutionId]);

  const handleFilterChange = useCallback<FiltersProps["onFilterChange"]>(
    ({ type, value }) => {
      handleModalClose();
      setDisplayOptions({
        ...displayOptions,
        [type]: value,
      });
    },
    [displayOptions]
  );

  const handleModalClose = () => setActiveSearchPhrase(null);

  return (
    <LabProvider
      currentExecution={currentExecution}
      searchConfiguration={searchConfiguration}
      rulesets={rulesets}
    >
      <BackdropLoadingSpinner open={propsLoading} />
      <div>
        {!!searchConfiguration && searchPhrases ? (
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
                        executions={executions}
                        activeExecution={activeExecution}
                        onSelected={(id: string) => setCurrentExecutionId(id)}
                      />
                    )}
                  </Box>
                )}
              </Grid>
            </Grid>
          </div>
        ) : (
          <NoExistingExecution
            searchConfiguration={searchConfiguration}
            searchEndpointType={searchEndpointType}
            projectId={router.query.projectId as string}
          />
        )}
        {!!searchConfiguration && searchPhrases && (
          <Configuration searchEndpointType={searchEndpointType} />
        )}
      </div>
    </LabProvider>
  );
}
