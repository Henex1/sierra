import React from "react";
import {
  makeStyles,
  Typography,
  IconButton,
  Tooltip,
  ClickAwayListener,
  Paper,
  Grow,
  MenuItem,
  MenuList,
  Popper,
} from "@material-ui/core";

import PatternEditor from "./PatternEditor";
import CaseSensitiveIcon from "./CaseSensitiveIcon";
import StartsWithIcon from "./StartsWithIcon";
import EndsWithIcon from "./EndsWithIcon";
import ContainedIcon from "./ContainedIcon";

const useStyles = makeStyles(() => ({
  inputParentContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#EEE",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottom: "1px solid grey",
    padding: "6px 6px 2px 8px",
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
    "& .ace_cursor": {
      marginLeft: "0px !important",
    },
    "& .ace_placeholder": {
      color: "#555 !important",
      marginLeft: -2,
      fontSize: 16,
    },
    "& span": {
      color: "#000 !important",
    },
  },
  container: {
    width: "100%",
    display: "table",
    fontFamily: "monaco, Consolas, 'Lucida Console', monospace",
    "& > *": {
      display: "table-cell",
      verticalAlign: "top",
    },
    "& .ace_hidden-cursors .ace_cursor": {
      display: "none !important",
    },
    marginBottom: 2,
  },
  iconButton: {
    padding: 0,
    margin: 0,
  },
  expressionTypePopper: {
    zIndex: 10,
  },
  enableColoring: {},
}));

type SearchTypeProps = {
  value: string;
  text: string;
  icon: JSX.Element;
};

const searchTypes: Array<SearchTypeProps> = [
  {
    value: "contained",
    text: "Contained",
    icon: <ContainedIcon htmlColor="#333" />,
  },
  {
    value: "starts_with",
    text: "Starts With",
    icon: <StartsWithIcon htmlColor="#333" />,
  },
  {
    value: "ends_with",
    text: "Ends With",
    icon: <EndsWithIcon htmlColor="#333" />,
  },
  {
    value: "regex",
    text: "Regex",
    icon: <EndsWithIcon htmlColor="#333" />,
  },
];

type RulesType = {
  expression: string;
  expressionType: string;
  isCaseSensitive: boolean;
  instructions: Array<any>;
  enabled: boolean;
};

type RegexInputFieldProps = {
  setRulesValue: (key: string, value: string | boolean) => void;
  value: string;
  rule: RulesType;
  activeRuleset: number;
  onChange: (value: string, event: React.ChangeEvent) => void;
};

export default function RegexInput({
  value,
  onChange,
  activeRuleset,
  rule,
  setRulesValue,
}: RegexInputFieldProps) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleSearchType = (
    event: React.MouseEvent<HTMLElement>,
    value: string
  ) => {
    setRulesValue(`rules[${activeRuleset}].expressionType`, value);
    handleClose(event);
  };

  function toggleCaseSensitivity() {
    setRulesValue(
      `rules[${activeRuleset}].isCaseSensitive`,
      !rule.isCaseSensitive
    );
  }

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

  function getIcon(type: string) {
    const item = searchTypes.find((item) => item.value === type);
    return item?.icon || null;
  }

  function isRegexDetected(): boolean {
    return (
      value.trim().length > 2 &&
      value[0] === "/" &&
      value[value.length - 1] === "/"
    );
  }

  return (
    <div className={classes.inputParentContainer}>
      <div className={classes.inputChildContainer}>
        <div className={classes.labelInputContainer}>
          <div className={classes.label}>Expression</div>
          <div className={classes.inputContainer}>
            <div
              className={`${classes.container} ${
                isRegexDetected()
                  ? classes.enableColoring
                  : classes.disableColoring
              }`}
            >
              <PatternEditor value={value} onChange={onChange} />
            </div>
          </div>
        </div>
        <div>
          {!isRegexDetected() && (
            <React.Fragment>
              <Tooltip title="Expression type">
                <IconButton
                  className={classes.iconButton}
                  size="small"
                  ref={anchorRef}
                  aria-controls={open ? "search-type" : undefined}
                  aria-haspopup="true"
                  onClick={handleToggle}
                >
                  {getIcon(rule.expressionType)}
                </IconButton>
              </Tooltip>
              <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                className={classes.expressionTypePopper}
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
                          {searchTypes
                            .filter(({ value }) => value !== "regex")
                            .map(({ value, text, icon }, index) => {
                              return (
                                <MenuItem
                                  key={index}
                                  onClick={(event) =>
                                    handleSearchType(event, value)
                                  }
                                  selected={rule.expressionType === value}
                                >
                                  {icon}
                                  <Typography
                                    variant="body2"
                                    style={{ marginLeft: 5 }}
                                  >
                                    {text}
                                  </Typography>
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
              title={
                rule.isCaseSensitive ? "Case sensitive" : "Case insensitive"
              }
            >
              <IconButton
                className={classes.iconButton}
                size="small"
                onClick={toggleCaseSensitivity}
              >
                <CaseSensitiveIcon
                  htmlColor={rule.isCaseSensitive ? "#333" : "#BBB"}
                />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
