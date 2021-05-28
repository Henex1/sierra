import _ from "lodash";
import React, { useCallback } from "react";
import { Grid, Typography, Box, makeStyles } from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import { useRouter } from "next/router";

import { apiRequest } from "../../lib/api";
import Filters from "../../components/lab/Filters";
import SearchPhraseList from "../../components/lab/SearchPhraseList";
import ResultList from "../../components/lab/ResultList";
import ActionButtons from "../../components/lab/ActionButtons";
import { getProject } from "../../lib/projects";
import {
  getActiveSearchConfiguration,
  formatSearchConfiguration,
  ExposedSearchConfiguration,
} from "../../lib/searchconfigurations";
import {
  getLatestExecution,
  countSearchPhrases,
  getSearchPhrases,
} from "../../lib/execution";
import { ExposedSearchPhrase, ShowOptions, SortOptions } from "../../lib/lab";
import {
  authenticatedPage,
  requireParam,
  optionalNumberQuery,
} from "../../lib/pageHelpers";
import {
  listRulesets,
  formatRuleset,
  ExposedRuleset,
  formatRulesetVersion,
  ExposedRulesetVersion,
  getRulesetsForSearchConfiguration,
} from "../../lib/rulesets";
import {
  QueryTemplate,
  getQueryTemplate,
  ExposedQueryTemplate,
  formatQueryTemplate,
} from "../../lib/querytemplates";
import NoExistingExcution from "components/lab/NoExistingExcution";

const useStyles = makeStyles((theme) => ({
  listContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4),
  },
  listBorder: {
    borderRight: "5px solid rgba(0, 0, 0, 0.08)",
  },
}));

const pageSize = 20;

type Props = {
  searchConfiguration:
    | (ExposedSearchConfiguration & {
        queryTemplate: ExposedQueryTemplate;
        rulesets: ExposedRulesetVersion[];
      })
    | null;
  searchPhrases: ExposedSearchPhrase[];
  searchPhrasesTotal: number;
  rulesets: ExposedRuleset[];
  timings?: Record<"p50" | "p95" | "p99", number>;
  displayOptions: {
    show: ShowOptions;
    sort: SortOptions;
  };
  page: number;
};

export const getServerSideProps = authenticatedPage<Props>(async (context) => {
  const projectId = requireParam(context, "projectId");
  const project = await getProject(context.user, projectId);
  if (!project) {
    return { notFound: true };
  }
  const page = optionalNumberQuery(context, "page", 1) - 1;
  const sc = await getActiveSearchConfiguration(project);
  const execution = sc ? await getLatestExecution(sc) : null;
  const searchPhrasesTotal = execution
    ? await countSearchPhrases(execution)
    : 0;
  const displayOptions = {
    show: (context.query.show as ShowOptions) || "all",
    sort: (context.query.sort as SortOptions) || "search-phrase-asc",
  };
  const searchPhrases = execution
    ? await getSearchPhrases(execution, {
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
  const rulesets = await listRulesets(context.user);
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

  return {
    props: {
      searchConfiguration,
      searchPhrases: formattedPhrases,
      searchPhrasesTotal,
      rulesets: rulesets.map(formatRuleset),
      timings: execution
        ? {
            p50: (execution.meta as any).tookP50,
            p95: (execution.meta as any).tookP95,
            p99: (execution.meta as any).tookP99,
          }
        : undefined,
      displayOptions,
      page: page + 1,
    },
  };
});

export default function Lab({
  searchConfiguration,
  searchPhrases,
  searchPhrasesTotal,
  rulesets,
  timings,
  ...props
}: Props) {
  const classes = useStyles();
  const router = useRouter();
  const [
    searchPhrase,
    setSearchPhrase,
  ] = React.useState<ExposedSearchPhrase | null>(null);
  const [displayOptions, setDisplayOptions] = React.useState<
    Props["displayOptions"]
  >({
    show: props.displayOptions.show,
    sort: props.displayOptions.sort,
  });
  const [page, setPage] = React.useState(props.page);
  const [isTestRunning, setIsTestRunning] = React.useState(false);
  const searchConfigurationId = searchConfiguration?.id;

  React.useEffect(() => {
    if (searchPhrase) {
      const padding = window.innerWidth - document.body.offsetWidth;
      document.body.style.paddingRight = padding + "px";
      document.body.style.overflow = "hidden";
      document.querySelectorAll(".mui-fixed").forEach((item) => {
        (item as any).style.paddingRight =
          (parseInt(getComputedStyle(item).paddingRight) || 0) + padding + "px";
      });
    } else {
      document.body.style.removeProperty("padding");
      document.body.style.removeProperty("overflow");
      document.querySelectorAll(".mui-fixed").forEach((item) => {
        (item as any).style.removeProperty("padding");
      });
    }
  }, [searchPhrase]);

  React.useEffect(() => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        show: displayOptions.show,
        sort: displayOptions.sort,
        page,
      },
    });
  }, [displayOptions, page]);

  const handleFilterChange = useCallback(
    (key: "show" | "sort", value: ShowOptions | SortOptions) => {
      setDisplayOptions({
        ...displayOptions,
        [key]: value,
      });
    },
    []
  );

  const handleModalClose = useCallback(() => setSearchPhrase(null), []);

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
    <div>
      {!!searchConfiguration && !isFirstQueryExcute ? (
        <div>
          <Grid container justify="space-between">
            {timings && (
              <Grid item>
                <Box mb={1}>
                  <Typography>
                    Showing {searchPhrases.length} search phrases..
                  </Typography>
                  <Box pt={1}>
                    <Typography variant="body2" color="textSecondary">
                      Latency Percentiles (ms):
                      <br />
                      50th percentile <b>{timings.p50.toFixed(0)}</b>, 95th
                      percentile <b>{timings.p95.toFixed(0)}</b>, 99th
                      percentile <b>{timings.p99.toFixed(0)}</b>
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            <Grid item>
              <Filters
                filters={displayOptions}
                onFilterChange={handleFilterChange}
              />
            </Grid>
          </Grid>
          <Grid container className={classes.listContainer}>
            <Grid
              item
              sm={searchPhrase ? 3 : true}
              className={searchPhrase ? classes.listBorder : undefined}
            >
              <SearchPhraseList
                searchPhrases={searchPhrases}
                activePhrase={searchPhrase}
                setActivePhrase={setSearchPhrase}
              />
            </Grid>
            {searchPhrase && (
              <Grid item md={9}>
                <ResultList
                  searchPhrase={searchPhrase}
                  onClose={handleModalClose}
                />
              </Grid>
            )}
          </Grid>
          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              page={page}
              count={Math.ceil(searchPhrasesTotal / pageSize)}
              onChange={(e: React.ChangeEvent<unknown>, value: number) =>
                setPage(value)
              }
            />
          </Box>
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
  );
}
