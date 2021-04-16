import React from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Tooltip,
  Typography,
  colors,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { makeStyles } from "@material-ui/core/styles";
import { scaleLinear } from "d3-scale";
import { useRouter } from "next/router";

import Filters from "../../components/lab/Filters";
import DetailModal from "../../components/lab/DetailModal";
import ActionButtons from "../../components/lab/ActionButtons";
import { getProject } from "../../lib/projects";
import {
  getSearchPhrases,
  formatSearchPhrase,
  ExposedSearchPhrase,
} from "../../lib/searchphrases";
import { MockSearchPhrase, ShowOptions, SortOptions } from "../../lib/lab";
import { authenticatedPage } from "../../lib/auth";

const useStyles = makeStyles((theme) => ({
  list: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  empty: {
    marginTop: theme.spacing(16),
    marginBottom: theme.spacing(16),
    textAlign: "center",
  },
  avatar: {
    fontSize: "18px",
    color: "#111",
  },
  fabContainer: {
    position: "fixed",
    right: 50,
    bottom: 50,
  },
  runFab: {
    marginRight: theme.spacing(1),
  },
  fabIcon: {
    marginRight: theme.spacing(1),
  },
}));

const colorScale = scaleLinear<string, string>()
  .domain([0, 50, 100])
  .range([colors.red[500], colors.yellow[500], colors.green[500]]);

export const getServerSideProps = authenticatedPage(async (context) => {
  const projectId = parseInt(context.query.projectId as string, 10);
  const project = await getProject(context.user, projectId);
  if (!project) {
    return { notFound: true };
  }
  const opts = {
    sort: context.query.sort as string,
    show: context.query.show as string,
  };
  const searchPhrases = await getSearchPhrases(project);
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
  return { props: { searchPhrases: mockObjects } };
});

type Props = {
  searchPhrases: MockSearchPhrase[];
};

export default function Lab({ searchPhrases }: Props) {
  const classes = useStyles();
  const router = useRouter();
  const [
    searchPhrase,
    setSearchPhrase,
  ] = React.useState<MockSearchPhrase | null>(null);
  const [filters, setFilters] = React.useState<{
    show: ShowOptions;
    sort: SortOptions;
  }>({
    show: "all",
    sort: "search-phrase-asc",
  });
  const [configurations, setConfigurations] = React.useState({});
  const [isTestRunning, setIsTestRunning] = React.useState(false);

  React.useEffect(() => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        show: filters.show,
        sort: filters.sort,
      },
    });
  }, [filters]);

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
      <Filters filters={filters} onFilterChange={handleFilterChange} />
      {searchPhrases.length ? (
        <List className={classes.list}>
          {searchPhrases.map((item, i) => {
            const handleClick = () => setSearchPhrase(item);
            return (
              <ListItem key={i}>
                <ListItemAvatar>
                  <Tooltip title="Sierra score">
                    <Avatar
                      variant="rounded"
                      className={classes.avatar}
                      style={{
                        background: colorScale(item.score.sierra),
                      }}
                    >
                      {item.score.sierra}
                    </Avatar>
                  </Tooltip>
                </ListItemAvatar>
                <ListItemText
                  primary={item.phrase}
                  secondary={item.results + " results"}
                ></ListItemText>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="Details"
                    onClick={handleClick}
                  >
                    <SearchIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography variant="body1" className={classes.empty}>
          No results.
        </Typography>
      )}
      {searchPhrase && (
        <DetailModal searchPhrase={searchPhrase} onClose={handleModalClose} />
      )}
      <ActionButtons
        configurations={configurations}
        isRunning={isTestRunning}
        onRun={handleRun}
        onConfigurationsChange={handleConfigurationsChange}
      />
    </div>
  );
}
