import * as React from "react";
import classnames from "classnames";
import {debounce} from "lodash";
import {
    Box,
    Button,
    Grid,
    IconButton,
    InputBase, Modal,
    Paper,
    Popover,
    Snackbar,
    TextField,
    Typography
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import FullScreenIcon from "@material-ui/icons/Fullscreen";
import SettingsIcon from "@material-ui/icons/Settings";
import {makeStyles} from "@material-ui/core/styles";
import JSONTree from "react-json-tree";
import {Alert} from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
    boxWrapper: {
        width: "100%",
        maxHeight: 36,
        marginBottom: 10
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
        backgroundColor: "transparent"
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
        "& button": {

        }
    },
    popover: {
        padding: 10
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
      height: 300,
      width: 600,
      padding: 15,
      backgroundColor: "#FFF",
      marginBottom: 20,
      overflow: "hidden",
      position: "relative"
    },
    searchResultText: {
      height: 150
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
            color: theme.palette.primary.contrastText
        },
    },
    selectedSuggestion: {
        backgroundColor: theme.palette.primary.main,
    }
}));

const jsonTheme = {
    scheme: 'bright',
    author: 'chris kempson (http://chriskempson.com)',
    base00: '#000000',
    base01: '#303030',
    base02: '#505050',
    base03: '#b0b0b0',
    base04: '#d0d0d0',
    base05: '#e0e0e0',
    base06: '#f5f5f5',
    base07: '#ffffff',
    base08: '#fb0120',
    base09: '#fc6d24',
    base0A: '#fda331',
    base0B: '#a1c659',
    base0C: '#76c7b7',
    base0D: '#6fb3d2',
    base0E: '#d381c3',
    base0F: '#be643c'
};

export default function Testbed() {
    const classes = useStyles();
    const [settingsPopoverAnchor, setSettingsPopoverAnchor] = React.useState<HTMLButtonElement | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [queryInFocus, setQueryInFocus] = React.useState(false);
    const [autocompleteDataSource, setAutocompleteDataSource] = React.useState(-1);
    const [searchDataSource, setSearchDataSource] = React.useState(-1);
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [expandedResult, setExpandedResult] = React.useState<any | null>(null);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState(-1);
    const resultModalOpen = Boolean(expandedResult);
    const showAutocomplete = searchQuery && queryInFocus && suggestions.length > 0;
    const showErrorSnackbar = Boolean(error);
    const settingsPopoverOpen = Boolean(settingsPopoverAnchor);
    const debouncedSetQueryFocus = debounce(setQueryInFocus, 100);

    const search = async(query:string, datasource: number) => {
        const response = await fetch(`/api/datasources/query`, {
            method: "POST",
            body: JSON.stringify({
                query: JSON.stringify(
                    {
                        query: {
                            match: {
                                long_description: query
                            }
                        }
                    }
                ),
                datasourceId: datasource
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            setError(await response.text().catch(() => "Unknown error"));
            return;
        }
        const json = await response.json();
        setSearchResults(json.hits.hits)
    }

    const loadAutocomplete = async (text: string, datasource: number) => {
        const response = await fetch(`/api/datasources/query`, {
            method: "POST",
            body: JSON.stringify({
                query: JSON.stringify(
                    {
                        suggest: {
                            autocomplete: {
                                prefix: text,
                                completion: {
                                    field: "suggest",
                                    size: 10,
                                    skip_duplicates: false
                                }
                            }

                        }
                    }
                ),
                datasourceId: datasource
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            setError(await response.text().catch(() => "Unknown error"));
            return;
        }
        const json = await response.json();
        if (json.suggest?.autocomplete?.length && json.suggest?.autocomplete[0].options?.length) {
            setSuggestions(json.suggest?.autocomplete[0].options.map((option: any) => option.text));
        }
    }

    const debouncedAutocomplete = React.useCallback(debounce(loadAutocomplete, 300), []);

    const handleTextChange = (text: string) => {
        setSearchQuery(text);
        debouncedAutocomplete(text, autocompleteDataSource)
    }

    const openSettingsPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
        setSettingsPopoverAnchor(event.currentTarget);
    }

    const closeSettingsPopover = () => {
        setSettingsPopoverAnchor(null);
    }

    const renderAutocompleteSuggestions = () => {
        return suggestions.map((suggestion, index) =>
            <div
                key={suggestion}
                className={index === selectedSuggestionIndex ? classnames(classes.suggestion, classes.selectedSuggestion) : classes.suggestion}
                onClick={() => handleTextChange(suggestion)}
            >
                {suggestion}
            </div>);
    }

    const getTypeAheadText = () => {
        if (!showAutocomplete) {
            return "";
        }
        return searchQuery + suggestions[0].substring(searchQuery.length);
    };


    const handleAutoCompleteSourceChange = (id: number) => {
        setAutocompleteDataSource(id)
    }

    const handleSearchSourceChange = (id: number) => {
        setSearchDataSource(id)
    }

    const handleSearchFieldKeyDown = (event:React.KeyboardEvent) => {
        const key = event.key;
        if (!showAutocomplete) {
            setSelectedSuggestionIndex(-1)
            return;
        }
        if (key === "Tab" && searchQuery != suggestions[0]) {
            event.preventDefault();
            setSearchQuery(suggestions[0])
        }

        if (key === "ArrowDown") {
            event.preventDefault();
            setSelectedSuggestionIndex(prevState => prevState + 1 > suggestions.length ? 0 : prevState + 1);
        }
        if (key === "ArrowUp") {
            event.preventDefault();
            setSelectedSuggestionIndex(prevState => prevState - 1 < 0 ? suggestions.length - 1 : prevState - 1)
        }

        if (key === "Enter" && selectedSuggestionIndex > -1) {
            if (suggestions[selectedSuggestionIndex]) {
                setSearchQuery(() => {
                    return suggestions[selectedSuggestionIndex]
                });
                setSelectedSuggestionIndex(-1);
                setQueryInFocus(false);
            }
        }

        if (key === "Esc" || key === "Escape") {
            setSelectedSuggestionIndex(-1);
            setQueryInFocus(() => false);
        }

    }

    const renderSearchResult = (result: any) => (
        <Paper key={result._id} className={classes.searchResult}>
            <IconButton onClick={() => setExpandedResult(result)} style={{position: "absolute", "top": 15, "right": 15}}>
                <FullScreenIcon />
            </IconButton>
            <Grid container>
                <Grid item xs={4}>
                    <div>
                        <Typography color="textSecondary">Base name</Typography>
                        <Typography>{result?._source?.base_name}</Typography>
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <div>
                        <Typography color="textSecondary">Base Code</Typography>
                        <Typography>{result?._source?.base_code}</Typography>
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <div>
                        <Typography color="textSecondary">Score</Typography>
                        <Typography>{result?._score}</Typography>
                    </div>
                </Grid>
                <Grid item xs={12} style={{marginTop: 15}}>
                    <div className={classes.searchResultText}>
                        <Typography color="textSecondary">Short Description</Typography>
                        <Typography>{result?._source?.short_description || "No description"}</Typography>
                    </div>
                </Grid>
                <Grid item xs={8}>
                    <div>
                        <Typography color="textSecondary">Url</Typography>
                        <Typography>{result?._source?.url}</Typography>
                    </div>
                </Grid>
            </Grid>
        </Paper>
    )

    const clearError = () => setError(null);

    return (
        <Box display="flex" flexDirection="column" style={{position: "relative"}} >
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
                            onChange={ev => handleTextChange(ev.target.value)}
                            onKeyDown={handleSearchFieldKeyDown}
                            onFocus={() => debouncedSetQueryFocus(true)}
                            onBlur={() => debouncedSetQueryFocus(false)}
                        />
                    </div>
                    {
                        showAutocomplete &&
                        <div className={classes.autocomplete}>
                            {renderAutocompleteSuggestions()}
                        </div>
                    }
                </Box>
                <Box>
                    <Button variant="contained" color="primary" className={classes.searchButton} onClick={() => search(searchQuery, searchDataSource)}><SearchIcon /></Button>
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
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        <Box className={classes.popover} display="flex" flexDirection="column">
                            <Typography>Settings</Typography>
                            <TextField label="Autocomplete index" value={autocompleteDataSource} onChange={(ev) => handleAutoCompleteSourceChange(Number(ev.target.value))}/>
                            <TextField label="Search index" value={searchDataSource} onChange={(ev) => handleSearchSourceChange(Number(ev.target.value))}/>
                        </Box>
                    </Popover>
                </Box>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center">
                <Modal
                    open={resultModalOpen}
                    onClose={() => setExpandedResult(null)}
                    disableEnforceFocus
                    style={{display:'flex',alignItems:'center',justifyContent:'center'}}
                >
                    <Paper style={{height: 500, width: 500, padding: 10, overflow: "scroll"}}>
                        <JSONTree data={expandedResult} theme={jsonTheme}/>
                    </Paper>
                </Modal>
                {searchResults.map(result => renderSearchResult(result)
                )}
            </Box>
            <Snackbar open={showErrorSnackbar} autoHideDuration={6000} onClose={clearError}>
                <Alert onClose={clearError} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}
