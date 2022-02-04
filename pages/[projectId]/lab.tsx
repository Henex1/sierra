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
import { ExposedProject, formatProject, getProject } from "../../lib/projects";
import {
  formatSearchConfiguration,
  ExposedSearchConfiguration,
  getActiveSearchConfiguration,
  loadSearchConfigurations,
  getSearchConfiguration,
} from "../../lib/searchconfigurations";
import {
  countSearchPhrases,
  getSearchPhrases,
  ExposedExecution,
  getLatestExecution,
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
  project: ExposedProject;
  searchConfiguration:
    | (ExposedSearchConfiguration & {
        queryTemplate: ExposedQueryTemplate;
        rulesets: ExposedRulesetVersion[];
      })
    | null; // search configuration being viewed/selected
  searchPhrases: ExposedSearchPhrase[] | null;
  searchPhrasesTotal: number;
  rulesets: ExposedRulesetWithVersions[];
  templates: ExposedQueryTemplate[];
  searchConfigurations: ExposedSearchConfiguration[];
  allSCsLength: number;
  activeSearchConfiguration: ExposedSearchConfiguration | null; // search configuration being deployed
  currentExecution: ExposedExecution | null;
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

  // Query parameters
  const {
    sc: currentSCId = "",
    show = "all",
    sort = "score-desc",
    search = "",
  } = context.query;

  // Get current search configuration
  const currentSearchConfiguration =
    (await getSearchConfiguration(context.user, currentSCId as string)) ??
    (await getActiveSearchConfiguration(project));

  // Get current execution
  const currentExecution = await getLatestExecution(
    currentSearchConfiguration ?? undefined
  );
  // Get active search configuration
  const activeSearchConfiguration = await getActiveSearchConfiguration(project);

  // Get SCs for selected project
  const { searchConfigurations, allSCsLength } = await loadSearchConfigurations(
    project.id,
    activeSearchConfiguration?.id
  );

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
      project: formatProject(project),
      searchConfiguration,
      searchPhrases: formattedPhrases || null,
      searchPhrasesTotal,
      rulesets: rulesetsWithVersions,
      templates: templates.map(formatQueryTemplate),
      searchConfigurations: searchConfigurations.map((searchConfig) =>
        formatSearchConfiguration(searchConfig, searchEndpoint.type)
      ),
      allSCsLength,
      activeSearchConfiguration: activeSearchConfiguration
        ? formatSearchConfiguration(
            activeSearchConfiguration,
            searchEndpoint.type
          )
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
  project,
  searchConfiguration,
  searchPhrases,
  searchPhrasesTotal,
  rulesets,
  templates,
  searchConfigurations,
  allSCsLength,
  activeSearchConfiguration,
  currentExecution,
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
  const [currentSearchConfigId, setCurrentSearchConfigId] = React.useState<
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
        sc: currentSearchConfigId,
        page,
      },
    });
  }, [displayOptions, page, currentSearchConfigId]);

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
      project={project}
      currentExecution={currentExecution}
      searchConfiguration={searchConfiguration}
      rulesets={rulesets}
    >
      <BackdropLoadingSpinner open={propsLoading} />
      <div>
        {searchConfiguration ? (
          <div>
            <Grid container spacing={4} className={classes.listContainer}>
              <Grid item sm={4} className={classes.listBorder}>
                {searchPhrases ? (
                  <>
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
                        onChange={(
                          e: React.ChangeEvent<unknown>,
                          value: number
                        ) => setPage(value)}
                      />
                    </Box>
                  </>
                ) : (
                  <Box>
                    <Typography variant="h6">
                      Current search configuration has never been run
                    </Typography>
                  </Box>
                )}
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
                    {activeSearchConfiguration && (
                      <ExecutionSummary
                        templates={templates}
                        searchConfigurations={searchConfigurations}
                        allSCsLength={allSCsLength}
                        activeSearchConfig={activeSearchConfiguration}
                        onSelected={(id: string) =>
                          setCurrentSearchConfigId(id)
                        }
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
        {!!searchConfiguration && (
          <Configuration searchEndpointType={searchEndpointType} />
        )}
      </div>
    </LabProvider>
  );
}
