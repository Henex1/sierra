import _ from "lodash";
import React, { useState } from "react";
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
import { MockSearchPhrase, ShowOptions, SortOptions } from "../../lib/lab";
import {
  authenticatedPage,
  requireNumberParam,
  optionalNumberQuery,
} from "../../lib/pageHelpers";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";
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

export const getServerSideProps = authenticatedPage(async (context) => {
  const projectId = requireNumberParam(context, "projectId");
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
  const searchPhrases = execution
    ? await getSearchPhrases(execution, {
        skip: pageSize * page,
        take: pageSize,
      })
    : [];
  const filters = {
    show: (context.query.show as string) || "all",
    sort: (context.query.sort as string) || "search-phrase-asc",
  };
  const mockObjects = searchPhrases.map((phrase) => {
    return {
      id: phrase.id,
      phrase: phrase.phrase,
      score: {
        sierra: phrase.combinedScore * 100,
        ..._.mapValues(phrase.allScores as object, (s) => s * 100),
      },
      results: phrase.totalResults,
    };
  });
  return {
    props: {
      searchConfiguration: sc ? formatSearchConfiguration(sc) : null,
      searchPhrases: mockObjects,
      searchPhrasesTotal,
      filters,
      page: page + 1,
    },
  };
});

type Props = {
  searchConfiguration: ExposedSearchConfiguration | null;
  searchPhrases: MockSearchPhrase[];
  searchPhrasesTotal: number;
  filters: {
    show: ShowOptions;
    sort: SortOptions;
  };
  page: number;
};

export default function Lab({
  searchConfiguration,
  searchPhrases,
  searchPhrasesTotal,
  ...props
}: Props) {
  const classes = useStyles();
  const router = useRouter();
  const [
    searchPhrase,
    setSearchPhrase,
  ] = React.useState<MockSearchPhrase | null>(null);
  const [filters, setFilters] = React.useState<Props["filters"]>({
    show: props.filters.show,
    sort: props.filters.sort,
  });
  const [page, setPage] = React.useState(props.page);
  const [configurations, setConfigurations] = React.useState({});
  const [isTestRunning, setIsTestRunning] = React.useState(false);
  const executionExists = Boolean(searchPhrases.length);

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
        show: filters.show,
        sort: filters.sort,
        page,
      },
    });
  }, [filters, page]);

  const handleFilterChange = (
    key: "show" | "sort",
    value: ShowOptions | SortOptions
  ) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const handleModalClose = () => {
    setSearchPhrase(null);
  };

  const handleRun = async () => {
    setIsTestRunning(true);
    await apiRequest("/api/searchconfigurations/execute", {
      id: searchConfiguration!.id,
    });
    location.reload();
  };

  const handleConfigurationsChange = (configs: {}) => {
    // TODO
    setConfigurations(configs);
  };

  return (
    <div>
      {!!searchConfiguration && executionExists ? (
        <div>
          <Grid container justify="space-between">
            <Grid item>
              <Box mb={1}>
                <Typography>
                  Showing {searchPhrases.length} search phrases..
                </Typography>
                <Box pt={1}>
                  <Typography variant="body2" color="textSecondary">
                    Latency Percentiles (ms):
                    <br />
                    Mean <b>90</b>, 95th percentile <b>320</b>, 99th percentile{" "}
                    <b>2204</b>
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item>
              <Filters filters={filters} onFilterChange={handleFilterChange} />
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
          isRunQuery={executionExists}
        />
      )}
      <ActionButtons
        configurations={configurations}
        canRun={searchConfiguration !== null}
        isRunning={isTestRunning}
        onRun={handleRun}
        onConfigurationsChange={handleConfigurationsChange}
      />
    </div>
  );
}
