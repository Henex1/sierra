import React, { useMemo, useState } from "react";
import {
  AppBar,
  Chip,
  CircularProgress,
  Fab,
  Input,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import CreateIcon from "@material-ui/icons/Create";
import classNames from "classnames";
import { apiRequest } from "../../lib/api";
import Scrollable from "../common/Scrollable";
import { QueryPanelValues, QueryTemplateEditor } from "./QueryTemplateEditor";

export default function NoExistingExecution({
  searchConfiguration,
  searchEndpointType,
  projectId,
}: {
  searchConfiguration: any;
  searchEndpointType: string;
  projectId: string;
}) {
  const classes = useStyles();

  const defaultQueryTemplate = useMemo(() => {
    if (
      searchEndpointType === "ELASTICSEARCH" ||
      searchEndpointType === "OPENSEARCH"
    ) {
      return {
        query: JSON.stringify({
          query: {
            match: {
              title: "#$query#",
            },
          },
        }),
        knobs: {},
      };
    } else if (searchEndpointType === "SOLR") {
      return {
        query: "q=*:*",
        knobs: {},
      };
    }
    return { query: "", knobs: {} };
  }, [searchEndpointType]);

  const [isExecutionRunning, setIsExecutionRunning] = useState(false);
  const [queryTemplate, setQueryTemplate] = useState(defaultQueryTemplate);
  const [judgementName, setJudgementName] = useState(
    "Judgements by internal users"
  );
  const [searchPhrases, setSearchPhrases] = useState<string[]>([]);
  const [searchPhrasesInputValue, setSearchPhrasesInputValue] = useState("");

  const handleQueryTemplateChange = (data: QueryPanelValues) => {
    setQueryTemplate(data);
  };

  const handleSearchPhrasesKeyUp = (e: any) => {
    if (e.key === "Enter" && searchPhrasesInputValue.trim().length) {
      setSearchPhrases((searchPhrases) => [
        ...new Set([...searchPhrases, e.target.value]),
      ]);
      setSearchPhrasesInputValue("");
    }
  };
  const handleSearchPhrasesKeyDown = (e: any) => {
    if (
      e.key === "Backspace" &&
      !searchPhrasesInputValue.length &&
      searchPhrases.length
    ) {
      setSearchPhrases((searchPhrases) =>
        searchPhrases.slice(0, searchPhrases.length - 1)
      );
    }
  };

  const handleDeleteSearchPhrase = (deletedPhrase: string) =>
    setSearchPhrases((searchPhrases) =>
      searchPhrases.filter((phrase) => phrase !== deletedPhrase)
    );

  const handleSubmit = () => {
    if (
      !searchPhrases.length ||
      !judgementName.trim().length ||
      !isValidJson(queryTemplate.query)
    ) {
      return;
    }

    apiRequest("/api/searchconfigurations/create", {
      projectId,
      queryTemplateQuery: queryTemplate.query,
      knobs: queryTemplate.knobs,
      judgementName,
      searchPhrases,
    }).then((searchConfiguration) => {
      setIsExecutionRunning(true);
      apiRequest("/api/searchconfigurations/execute", {
        id: searchConfiguration.id,
      }).then(() => {
        window.location.reload();
      });
    });
  };

  return (
    <div>
      <div>
        <Typography variant="h6">
          No search configurations found. Let&apos;s get the first one in!
        </Typography>
      </div>
      <div className={classes.wrapper}>
        <div className={classes.queryTemplateContainer}>
          <AppBar position="static" classes={{ root: classes.appBar }}>
            <Typography variant="h6" noWrap>
              Query Template
            </Typography>
          </AppBar>
          <Scrollable
            classes={{
              root: classes.scrollableRoot,
              scroll: classes.scrollContainer,
            }}
            maxHeight="100%"
          >
            <QueryTemplateEditor
              formId="noExecutionQueryTemplateEditor"
              queryTemplate={defaultQueryTemplate}
              searchEndpointType={searchEndpointType}
              onFormValuesChange={handleQueryTemplateChange}
            />
          </Scrollable>
        </div>
        <div className={classes.fieldsContainer}>
          <TextField
            fullWidth
            value={judgementName}
            label="Judgement name"
            onChange={(e) => setJudgementName(e.target.value)}
          />
          <div className={classes.searchPhrasesContainer}>
            <div>
              {searchPhrases.map((phrase) => (
                <Chip
                  key={phrase}
                  className={classes.chip}
                  label={phrase}
                  onDelete={() => handleDeleteSearchPhrase(phrase)}
                />
              ))}
            </div>
            <Input
              type="text"
              fullWidth
              value={searchPhrasesInputValue}
              placeholder="Add search phrases"
              onKeyUp={handleSearchPhrasesKeyUp}
              onKeyDown={handleSearchPhrasesKeyDown}
              onChange={(e) => setSearchPhrasesInputValue(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className={classNames(classes.fabContainer, "mui-fixed")}>
        <Fab
          color="primary"
          variant="extended"
          className={classes.createFab}
          disabled={
            !!searchConfiguration ||
            isExecutionRunning ||
            !searchPhrases.length ||
            !judgementName.trim().length ||
            !isValidJson(queryTemplate.query)
          }
          onClick={handleSubmit}
        >
          {!!searchConfiguration || isExecutionRunning ? (
            <CircularProgress className={classes.fabIcon} size={20} />
          ) : (
            <CreateIcon className={classes.fabIcon} />
          )}
          Create Now
        </Fab>
      </div>
    </div>
  );
}

const isValidJson = (string: string) => {
  try {
    JSON.parse(string);
    return true;
  } catch {
    return false;
  }
};

const useStyles = makeStyles((theme) => ({
  wrapper: {
    height: "65vh",
    display: "flex",
    paddingTop: "20px",
  },
  queryTemplateContainer: {
    flexBasis: "40%",
    overflowY: "auto",
    overflowX: "hidden",
  },
  appBar: {
    height: "48px",
    padding: "0 10px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  scrollableRoot: {
    height: "calc(100% - 48px)",
  },
  scrollContainer: {
    height: "100%",
    overflowX: "hidden",
  },
  fieldsContainer: {
    flexBasis: "60%",
    padding: "0 20px",
  },
  searchPhrasesContainer: {
    margin: "15px 0",
  },
  chip: {
    marginRight: "5px",
    marginBottom: "5px",
  },
  fabContainer: {
    position: "fixed",
    bottom: 30,
  },
  createFab: {
    width: 160,
    marginRight: theme.spacing(2),
  },
  fabIcon: {
    marginRight: theme.spacing(1),
  },
}));
