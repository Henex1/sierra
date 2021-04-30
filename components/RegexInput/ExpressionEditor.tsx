import React from "react";
import PatternEditor from "./PatternEditor";
import { makeStyles } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CaseSensitiveIcon from "./CaseSensitiveIcon";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Paper from "@material-ui/core/Paper";
import Grow from "@material-ui/core/Grow";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Popper from "@material-ui/core/Popper";

const useStyles = makeStyles((theme) => ({
  inputParentContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#eee",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottom: "1px solid grey",
    padding: "6px 12px 2px 8px",
    width: "100%",
    flex: 1,
  },
  label: { fontSize: 12, marginLeft: 4 },
  button: {
    textTransform: "none",
  },
  inputChildContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelInputContainer: { display: "flex", flexDirection: "column", flex: 1 },
  inputContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  disableColoring: {
    "& span[role='presentation'] .exp-error": {
      borderBottom: "none",
    },
    "& span[role='presentation'] *": {
      color: "#000 !important",
      backgroundColor: "#eee",
    },
  },
  enableColoring: {},
}));

const searchTypes = ["Contained", "Starts With", "Ends With"];

type ExpressionEditorFieldProps = {
  pattern: string;
  onPatternChange: () => void;
  onPatternBeforeChange: (editor: object, data: object, value: string) => void;
  handleCaseSensitive: () => void;
  isCaseSensitive: boolean;
  width: number | string;
  height: number | string;
  searchType: string;
  setSearchType: (text: string) => void;
};

export default function ExpressionEditor({
  pattern,
  onPatternChange,
  onPatternBeforeChange,
  width,
  handleCaseSensitive,
  isCaseSensitive,
  height,
  searchType,
  setSearchType,
}: ExpressionEditorFieldProps) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleSearchType = (
    event: React.MouseEvent<HTMLElement>,
    value: string
  ) => {
    setSearchType(value);
    handleClose(event);
  };
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (
      anchorRef.current &&
      anchorRef?.current?.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef?.current?.focus();
    }

    prevOpen.current = open;
  }, [open]);

  function handleListKeyDown(event: React.KeyboardEvent<HTMLElement>): void {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  function isRegexDetected(): boolean {
    return (
      pattern.trim().length > 2 &&
      pattern[0] === "/" &&
      pattern[pattern.length - 1] == "/"
    );
  }

  return (
    <div className={classes.inputParentContainer}>
      <div className={classes.inputChildContainer}>
        <div className={classes.labelInputContainer}>
          <div className={classes.label}>Expression</div>
          <div className={classes.inputContainer}>
            <div
              className={`regexr regexr-expression ${
                isRegexDetected() ? "" : classes.disableColoring
              }`}
            >
              <PatternEditor
                height={height}
                width={width}
                value={pattern}
                onChange={onPatternChange}
                onBeforeChange={onPatternBeforeChange}
              />
            </div>
          </div>
        </div>
        <div>
          {!isRegexDetected() && (
            <React.Fragment>
              <Tooltip title="Expression type">
                <Button
                  size="small"
                  ref={anchorRef}
                  aria-controls={open ? "search-type" : undefined}
                  aria-haspopup="true"
                  onClick={handleToggle}
                  className={classes.button}
                >
                  {searchType}
                </Button>
              </Tooltip>
              <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                        placement === "bottom" ? "center top" : "center bottom",
                    }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList
                          autoFocusItem={open}
                          id="menu-list-grow"
                          onKeyDown={handleListKeyDown}
                        >
                          {searchTypes.map((type) => {
                            return (
                              <MenuItem
                                key={type}
                                onClick={(event) =>
                                  handleSearchType(event, type)
                                }
                                selected={searchType === type}
                              >
                                {type}
                              </MenuItem>
                            );
                          })}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </React.Fragment>
          )}
          {!isRegexDetected() && (
            <Tooltip
              title={isCaseSensitive ? "Case sensitive" : "Case insensitive"}
            >
              <IconButton
                style={{ paddingBottom: 0 }}
                size="small"
                onClick={handleCaseSensitive}
              >
                <CaseSensitiveIcon
                  htmlColor={isCaseSensitive ? "#333" : "#BBB"}
                />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}

