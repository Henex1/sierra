import * as React from "react";
import classnames from "classnames";
import { debounce } from "lodash";

import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Input,
  InputBase,
  ListItemText,
  MenuItem,
  Paper,
  Popover,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import SettingsIcon from "@material-ui/icons/Settings";
import { makeStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";

import { useActiveProject } from "../../components/Session";
import { authenticatedPage } from "../../lib/pageHelpers";
import {
  ExposedRuleset,
  formatRuleset,
  listRulesets,
} from "../../lib/rulesets";

import { apiRequest } from "../../lib/api";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";
import { getSearchEndpoint } from "../../lib/searchendpoints";
import { getProject } from "../../lib/projects";
import { uniq } from "lodash";
import { ResultCard } from "../../components/lab/ResultCard";

const useStyles = makeStyles((theme) => ({
  boxWrapper: {
    width: "100%",
    maxHeight: 36,
    marginBottom: 10,
  },
  inputBox: {
    boxShadow: "0px 4px 8px rgb(0 0 0 / 5%)",
    borderRadius: 4,
  },
  inputWrapper: {
    position: "relative",
    marginLeft: 5,
    marginRight: 5,
  },
  textField: {
    position: "relative",
    width: "100%",
    backgroundColor: "transparent",
  },
  typeAhead: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    "& input": {
      color: "#ccd6dd",
    },
  },
  searchButton: {
    height: "100%",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    "& button": {},
  },
  popover: {
    padding: 10,
  },
  autocomplete: {
    position: "absolute",
    width: "100%",
    zIndex: 9,
    top: "100%",
    boxShadow: "0px 5px 30px -10px rgba(0,0,0,0.2)",
    backgroundColor: "#fff",
  },
  searchResult: {
    width: 600,
    padding: 15,
    backgroundColor: "#FFF",
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  searchResultText: {
    height: 150,
  },
  suggestion: {
    borderBottom: "1px solid black",
    padding: 10,
    backgroundColor: "#fff",
    color: "#000",
    transition: "0.3s ease",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
  selectedSuggestion: {
    backgroundColor: theme.palette.primary.main,
  },
}));

export const getServerSideProps = authenticatedPage(async (context) => {
  const rulesets = await listRulesets(context.user).then((rs) =>
    rs.map(formatRuleset)
  );

  const getDisplayFields = async (id: string) => {
    return await getProject(context.user, id).then((p) =>
      p
        ? getSearchEndpoint(context.user, p.searchEndpointId).then(
            (v) => v?.displayFields ?? []
          )
        : []
    );
  };

  const projectIds = uniq(rulesets.map((v) => v.projectId));
  const fetchFields = await Promise.all(
    projectIds.map(async (id) => [id, await getDisplayFields(id)] as const)
  );
  const displayFields = fetchFields.reduce(
    (acc: Record<string, string[]>, [id, v]) => {
      acc[id] = v;
      return acc;
    },
    {}
  );

  return { props: { rulesets, displayFields } };
});

type Props = {
  rulesets: ExposedRuleset[];
  displayFields: Record<string, string[]>;
};

export default function Testbed({ rulesets, displayFields }: Props) {
  const { project } = useActiveProject();
  const classes = useStyles();
  const [
    settingsPopoverAnchor,
    setSettingsPopoverAnchor,
  ] = React.useState<HTMLButtonElement | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRulesetId, setSelectedRulesetId] = React.useState<string[]>(
    []
  );
  const [ltrModelName, setLtrModelName] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [queryInFocus, setQueryInFocus] = React.useState(false);
  const [
    autocompleteSearchEndpoint,
    setAutocompleteSearchEndpoint,
  ] = React.useState(-1);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [totalResults, setTotalResults] = React.useState("0");
  const [error, setError] = React.useState<string | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(
    -1
  );
  const showAutocomplete =
    searchQuery && queryInFocus && suggestions.length > 0;
  const showErrorSnackbar = Boolean(error);
  const settingsPopoverOpen = Boolean(settingsPopoverAnchor);
  const debouncedSetQueryFocus = debounce(setQueryInFocus, 100);

  const search = async () => {
    try {
      const json = await apiRequest<any>(`/api/testbed/query`, {
        query: searchQuery,
        projectId: project?.id,
        rulesetIds: selectedRulesetId,
        ltrModelName: ltrModelName ? ltrModelName : undefined,
      });
      setSearchResults(json.result?.hits?.hits || []);
      const total = json.result?.hits?.total;
      setTotalResults(
        total ? `${total.relation == "gte" ? ">" : ""}${total.value}` : "0"
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadAutocomplete = async (text: string, searchEndpoint: number) => {
    if (searchEndpoint > 0) {
      try {
        const json = await apiRequest(`/api/searchendpoints/query`, {
          query: JSON.stringify({
            suggest: {
              autocomplete: {
                prefix: text,
                completion: {
                  field: "suggest",
                  size: 10,
                  skip_duplicates: false,
                },
              },
            },
          }),
          searchEndpointId: searchEndpoint,
        });
        if (
          json.suggest?.autocomplete?.length &&
          json.suggest?.autocomplete[0].options?.length
        ) {
          setSuggestions(
            json.suggest?.autocomplete[0].options.map(
              (option: any) => option.text
            )
          );
        }
      } catch (err: any) {
        setError(err.message);
        return;
      }
    }
  };

  const debouncedAutocomplete = React.useCallback(
    debounce(loadAutocomplete, 300),
    []
  );

  const handleTextChange = (text: string) => {
    setSearchQuery(text);
    debouncedAutocomplete(text, autocompleteSearchEndpoint);
  };

  const openSettingsPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsPopoverAnchor(event.currentTarget);
  };

  const closeSettingsPopover = () => {
    setSettingsPopoverAnchor(null);
  };

  const renderAutocompleteSuggestions = () => {
    return suggestions.map((suggestion, index) => (
      <div
        key={suggestion}
        className={
          index === selectedSuggestionIndex
            ? classnames(classes.suggestion, classes.selectedSuggestion)
            : classes.suggestion
        }
        onClick={() => handleTextChange(suggestion)}
      >
        {suggestion}
      </div>
    ));
  };

  const getTypeAheadText = () => {
    if (!showAutocomplete) {
      return "";
    }
    return searchQuery + suggestions[0].substring(searchQuery.length);
  };

  const handleAutoCompleteSourceChange = (id: number) => {
    setAutocompleteSearchEndpoint(id);
  };

  const handleSearchFieldKeyDown = (event: React.KeyboardEvent) => {
    const key = event.key;
    if (!showAutocomplete) {
      setSelectedSuggestionIndex(-1);
      return;
    }
    if (key === "Tab" && searchQuery != suggestions[0]) {
      event.preventDefault();
      setSearchQuery(suggestions[0]);
    }

    if (key === "ArrowDown") {
      event.preventDefault();
      setSelectedSuggestionIndex((prevState) =>
        prevState + 1 > suggestions.length ? 0 : prevState + 1
      );
    }
    if (key === "ArrowUp") {
      event.preventDefault();
      setSelectedSuggestionIndex((prevState) =>
        prevState - 1 < 0 ? suggestions.length - 1 : prevState - 1
      );
    }

    if (key === "Enter" && selectedSuggestionIndex > -1) {
      if (suggestions[selectedSuggestionIndex]) {
        setSearchQuery(() => {
          return suggestions[selectedSuggestionIndex];
        });
        setSelectedSuggestionIndex(-1);
        setQueryInFocus(false);
      }
    }

    if (key === "Esc" || key === "Escape") {
      setSelectedSuggestionIndex(-1);
      setQueryInFocus(() => false);
    }
  };

  const renderSearchResult = (result: any) => (
    <Paper key={result._id} className={classes.searchResult}>
      <ResultCard
        displayFields={project ? displayFields[project.id] ?? [] : []}
        result={result?._source}
      />
    </Paper>
  );

  const clearError = () => setError(null);

  return (
    <Box display="flex" flexDirection="column" style={{ position: "relative" }}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Testbed</Typography>
      </BreadcrumbsButtons>
      <Box display="flex" className={classes.boxWrapper} alignItems="center">
        <Box flexGrow={1} className={classes.inputBox}>
          <div className={classes.inputWrapper}>
            <InputBase
              value={getTypeAheadText()}
              inputProps={{ tabIndex: -1 }}
              className={classnames(classes.textField, classes.typeAhead)}
            />
            <InputBase
              value={searchQuery}
              className={classes.textField}
              onChange={(ev) => handleTextChange(ev.target.value)}
              onKeyDown={handleSearchFieldKeyDown}
              onFocus={() => debouncedSetQueryFocus(true)}
              onBlur={() => debouncedSetQueryFocus(false)}
            />
          </div>
          {showAutocomplete && (
            <div className={classes.autocomplete}>
              {renderAutocompleteSuggestions()}
            </div>
          )}
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            className={classes.searchButton}
            onClick={() => search()}
          >
            <SearchIcon />
          </Button>
        </Box>
        <Box>
          <IconButton size="small" onClick={openSettingsPopover}>
            <SettingsIcon color="primary" />
          </IconButton>
          <Popover
            open={settingsPopoverOpen}
            onClose={closeSettingsPopover}
            anchorEl={settingsPopoverAnchor}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Box
              className={classes.popover}
              display="flex"
              flexDirection="column"
            >
              <Typography>Settings</Typography>
              <Select
                label="Rulesets"
                value={selectedRulesetId}
                input={<Input />}
                renderValue={(selected: any) => {
                  const fullRulesets = selected.map((s: any) =>
                    rulesets.find((r) => r.id === s)
                  );
                  return fullRulesets
                    .map((ruleset: ExposedRuleset) => ruleset.name)
                    .join(", ");
                }}
                multiple
                onChange={(ev) => {
                  setSelectedRulesetId(() => [
                    ...(ev.target.value as string[]),
                  ]);
                }}
              >
                {rulesets?.length &&
                  rulesets.map((ruleset) => (
                    <MenuItem key={ruleset.id} value={ruleset.id}>
                      <Checkbox
                        checked={selectedRulesetId.indexOf(ruleset.id) > -1}
                      />
                      <ListItemText primary={ruleset.name} />
                    </MenuItem>
                  ))}
              </Select>
              <TextField
                label="Autocomplete Search Endpoint"
                value={autocompleteSearchEndpoint}
                onChange={(ev) =>
                  handleAutoCompleteSourceChange(Number(ev.target.value))
                }
              />
              <TextField
                label="LTR Model"
                value={ltrModelName}
                onChange={(ev) => setLtrModelName(ev.target.value)}
              />
            </Box>
          </Popover>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography>Total results {totalResults}</Typography>
        {searchResults.map((result) => renderSearchResult(result))}
      </Box>
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={clearError}
      >
        <Alert onClose={clearError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
