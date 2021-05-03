import React from "react";
import PatternEditor from "./PatternEditor";
import { makeStyles, Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CaseSensitiveIcon from "./CaseSensitiveIcon";
import StartsWithIcon from "./StartsWithIcon";
import EndsWithIcon from "./EndsWithIcon";
import ContainedIcon from "./ContainedIcon";
import Tooltip from "@material-ui/core/Tooltip";
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
    marginBottom: 2,
  },
  iconButton: {
    padding: 0,
    margin: 0,
  },
  enableColoring: {},
}));

type SearchTypeProps = {
  text: string;
  icon: JSX.Element;
};

const searchTypes: Array<SearchTypeProps> = [
  { text: "Contained", icon: <ContainedIcon htmlColor="#333" /> },
  { text: "Starts With", icon: <StartsWithIcon htmlColor="#333" /> },
  { text: "Ends With", icon: <EndsWithIcon htmlColor="#333" /> },
];

type ExpressionEditorFieldProps = {
  handleCaseSensitive: () => void;
  isCaseSensitive: boolean;
  searchType: string;
  setSearchType: (text: string) => void;
  value: string;
  onChange: (value: string, event: React.ChangeEvent) => void;
};

export default function ExpressionEditor({
  value,
  onChange,
  handleCaseSensitive,
  isCaseSensitive,
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

  function getIcon(type: string) {
    return searchTypes.filter((item) => item.text === type)[0].icon;
  }

  function isRegexDetected(): boolean {
    return (
      value.trim().length > 2 &&
      value[0] === "/" &&
      value[value.length - 1] == "/"
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
                  {getIcon(searchType)}
                </IconButton>
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
                          {searchTypes.map(({ text, icon }, index) => {
                            return (
                              <MenuItem
                                key={index}
                                onClick={(event) =>
                                  handleSearchType(event, text)
                                }
                                selected={searchType === text}
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
              title={isCaseSensitive ? "Case sensitive" : "Case insensitive"}
            >
              <IconButton
                className={classes.iconButton}
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
