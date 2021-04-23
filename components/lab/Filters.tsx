import React from "react";
import {
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SvgIconProps,
  makeStyles,
} from "@material-ui/core";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

import { ShowOptions, SortOptions } from "../../lib/lab";

const useStyles = makeStyles((theme) => ({
  select: {
    display: "flex",
    alignItems: "center",
    minWidth: 140,
    minHeight: 24,
  },
  selectItemIcon: {
    marginLeft: theme.spacing(1),
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

type Props = {
  filters: {
    show: string;
    sort: string;
  };
  onFilterChange: (
    key: "show" | "sort",
    value: ShowOptions | SortOptions
  ) => void;
};

export default function Filters({ filters, onFilterChange }: Props) {
  const classes = useStyles();
  const handleChange = (key: "show" | "sort") => (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    onFilterChange(key, event.target.value as ShowOptions | SortOptions);
  };

  return (
    <Grid container justify="flex-end" spacing={2}>
      <Grid item>
        <FormControl variant="outlined">
          <InputLabel id="filtersShowLabel">Show</InputLabel>
          <Select
            id="filtersShow"
            labelId="filtersShowLabel"
            value={filters.show}
            onChange={handleChange("show")}
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
      <Grid item>
        <FormControl variant="outlined">
          <InputLabel id="filtersSortLabel">Sort</InputLabel>
          <Select
            id="filtersSort"
            labelId="filtersSortLabel"
            value={filters.sort}
            onChange={handleChange("sort")}
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
    </Grid>
  );
}
