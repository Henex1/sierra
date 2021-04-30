import React from "react";
import { Grid, Typography, Box, makeStyles } from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import { useRouter } from "next/router";

import Filters from "../../components/lab/Filters";
import SearchPhraseList from "../../components/lab/SearchPhraseList";
import ResultList from "../../components/lab/ResultList";
import ActionButtons from "../../components/lab/ActionButtons";
import { getProject } from "../../lib/projects";
import { getActiveSearchConfiguration } from "../../lib/searchconfigurations";
import {
  getLatestExecution,
  getSearchPhrases,
  SearchPhraseExecutionInfo,
} from "../../lib/execution";
import { MockSearchPhrase, ShowOptions, SortOptions } from "../../lib/lab";
import { authenticatedPage, requireNumberParam } from "../../lib/pageHelpers";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

const useStyles = makeStyles((theme) => ({
  listContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4),
  },
  listBorder: {
    borderRight: "5px solid rgba(0, 0, 0, 0.08)",
  },
}));

export const getServerSideProps = authenticatedPage(async (context) => {
  const projectId = requireNumberParam(context, "projectId");
  const project = await getProject(context.user, projectId);
  if (!project) {
    return { notFound: true };
  }
  const sc = await getActiveSearchConfiguration(project);
  const execution = sc ? await getLatestExecution(sc) : null;
  const searchPhrases = execution ? await getSearchPhrases(execution) : [];
  const opts = {
    show: (context.query.show as string) || "all",
    sort: (context.query.sort as string) || "search-phrase-asc",
    page: parseInt(context.query.page as string) || 1,
  };
  const mockObjects = searchPhrases.map((phrase) => {
    const randomValue = phrase.phrase
      .split("")
      .map((c) => c.charCodeAt(0))
      .reduce((a, b) => a + b);
    const s = ((randomValue * 79) % 1000) / 10;
    const r = Math.floor((randomValue * 97) % 250);
    return {
      id: phrase.id,
      phrase: phrase.phrase,
      score: {
        sierra: s,
        "ndc@5": s,
        "ap@5": s,
        "p@5": s,
      },
      results: r,
    };
  });
  const { page, ...filters } = opts;
  return {
    props: {
      searchPhrases: mockObjects,
      searchPhrasesTotal: 1001,
      filters,
      page,
    },
  };
});

type Props = {
  searchPhrases: MockSearchPhrase[];
  searchPhrasesTotal: number;
  filters: {
    show: ShowOptions;
    sort: SortOptions;
  };
  page: number;
};

export default function Lab({
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

  const handleRun = () => {
    setIsTestRunning(true);
    setTimeout(() => {
      setIsTestRunning(false);
    }, 1500);
  };

  const handleConfigurationsChange = (configs: {}) => {
    // TODO
    setConfigurations(configs);
  };

  return (
    <div>
      <Grid container justify="space-between">
        <Grid item>
          <Box mb={1}>
            <Typography>Showing 18 search phrases..</Typography>
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
          count={Math.ceil(searchPhrasesTotal / 10)}
          onChange={(e: React.ChangeEvent<unknown>, value: number) =>
            setPage(value)
          }
        />
      </Box>
      <ActionButtons
        configurations={configurations}
        isRunning={isTestRunning}
        onRun={handleRun}
        onConfigurationsChange={handleConfigurationsChange}
      />
    </div>
  );
}
