import React, { useState } from "react";
import {
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SvgIconProps,
  makeStyles,
  TextField,
} from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";

import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import { ShowOptions, SortOptions } from "../../lib/lab";
import SearchIcon from "@material-ui/icons/Search";
import classNames from "classnames";

const useStyles = makeStyles((theme) => ({
  gridItems: {
    transition: theme.transitions.create(["max-width", "flex-basis"]),
  },
  formControl: {
    width: "100%",
    position: "relative",
  },
  select: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  selectItemIcon: {
    marginLeft: theme.spacing(1),
    fontSize: theme.typography.fontSize,
  },
  search: {
    position: "relative",
    width: "35px",
    transition: theme.transitions.create("width"),
  },
  activeSearch: {
    width: "100%",
  },
  searchInput: {
    paddingRight: "35px",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    cursor: "pointer",
    width: 0,
    paddingLeft: 0,
    transition: theme.transitions.create("width"),
  },
  searchInputActive: {
    width: "100%",
    paddingLeft: theme.spacing(),
    cursor: "initial",
  },
  searchIcon: {
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    right: 0,
    width: "35px",
    fontSize: theme.typography.fontSize,
  },
}));

type MenuItemProps = {
  label: string;
  icon?: React.ComponentType<SvgIconProps>;
};

type ShowMenuItemProps = MenuItemProps & {
  value: ShowOptions;
};

type SortMenuItemProps = MenuItemProps & {
  value: SortOptions;
};

const showOptions: ShowMenuItemProps[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "No Errors",
    value: "no-errors",
  },
  {
    label: "Errors Only",
    value: "errors-only",
  },
  {
    label: "Have Results",
    value: "have-results",
  },
  {
    label: "0 Results",
    value: "no-results",
  },
];

const sortOptions: SortMenuItemProps[] = [
  {
    label: "Search phrase",
    value: "search-phrase-asc",
    icon: ArrowUpwardIcon,
  },
  {
    label: "Search phrase",
    value: "search-phrase-desc",
    icon: ArrowDownwardIcon,
  },
  {
    label: "Score",
    value: "score-asc",
    icon: ArrowUpwardIcon,
  },
  {
    label: "Score",
    value: "score-desc",
    icon: ArrowDownwardIcon,
  },
  {
    label: "Errors",
    value: "errors-asc",
    icon: ArrowUpwardIcon,
  },
  {
    label: "Errors",
    value: "errors-desc",
    icon: ArrowDownwardIcon,
  },
  {
    label: "Search results",
    value: "search-results-asc",
    icon: ArrowUpwardIcon,
  },
  {
    label: "Search results",
    value: "search-results-desc",
    icon: ArrowDownwardIcon,
  },
];

export type Props = {
  filters: {
    show: string;
    sort: string;
    search: string;
  };
  onFilterChange: (
    v:
      | { type: "show"; value: ShowOptions }
      | { type: "sort"; value: SortOptions }
      | { type: "search"; value: string }
  ) => void;
};

export default function Filters({ filters, onFilterChange }: Props) {
  const classes = useStyles();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [focused, setActiveSearch] = useState(false);
  const activeSearch = focused || searchValue.length > 0;
  const submitSearch = () => {
    searchValue !== filters.search &&
      onFilterChange({
        type: "search",
        value: searchValue,
      });
  };

  return (
    <Grid container spacing={2} justify={"flex-end"} wrap={"nowrap"}>
      <Grid className={classes.gridItems} item md={activeSearch ? 3 : 5}>
        <FormControl className={classes.formControl} variant="outlined">
          <InputLabel id="filtersShowLabel">Show</InputLabel>
          <Select
            id="filtersShow"
            labelId="filtersShowLabel"
            value={filters.show}
            onChange={(e) =>
              onFilterChange({
                type: "show",
                value: e.target.value as ShowOptions,
              })
            }
            label="Show"
            classes={{ root: classes.select }}
          >
            {showOptions.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid className={classes.gridItems} item md={activeSearch ? 3 : 5}>
        <FormControl className={classes.formControl} variant="outlined">
          <InputLabel id="filtersSortLabel">Sort</InputLabel>
          <Select
            id="filtersSort"
            labelId="filtersSortLabel"
            value={filters.sort}
            onChange={(e) =>
              onFilterChange({
                type: "sort",
                value: e.target.value as SortOptions,
              })
            }
            label="Sort"
            classes={{ root: classes.select }}
          >
            {sortOptions.map((item) => {
              const Icon = item.icon;
              return (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                  {Icon && <Icon className={classes.selectItemIcon} />}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid className={classes.gridItems} item md={activeSearch ? 6 : 2}>
        <FormControl className={classes.formControl} variant="outlined">
          <div
            className={classNames(classes.search, {
              [classes.activeSearch]: activeSearch,
            })}
          >
            <TextField
              variant="outlined"
              placeholder={activeSearch ? "Starts with..." : ""}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => {
                e.code === "Enter" && submitSearch();
              }}
              inputProps={{
                "aria-label": "search",
                className: classNames(classes.searchInput, {
                  [classes.searchInputActive]: activeSearch,
                }),
                onFocus: () => !activeSearch && setActiveSearch(true),
                onBlur: () => {
                  submitSearch();
                  activeSearch && setActiveSearch(false);
                },
              }}
              size="small"
            />
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
          </div>
        </FormControl>
      </Grid>
    </Grid>
  );
}
