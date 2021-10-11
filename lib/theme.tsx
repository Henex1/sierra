import { createMuiTheme, Theme } from "@material-ui/core";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { red } from "@material-ui/core/colors";

declare module "@material-ui/core/styles/createMixins" {
  interface Mixins {
    withToolbar: (theme: Theme) => CSSProperties;
  }
}

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
  },
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: "14px",
        padding: "6px 12px",
      },
    },
    MuiPopover: {
      paper: {
        boxShadow: "0px 4px 8px rgb(0 0 0 / 10%)",
      },
    },
  },
  mixins: {
    withToolbar: (theme) => ({
      height: "calc(100% - 56px)",
      [`${theme.breakpoints.up("xs")} and (orientation: landscape)`]: {
        height: "calc(100% - 48px)",
      },
      [theme.breakpoints.up("sm")]: {
        height: "calc(100% - 64px)",
      },
    }),
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 930,
      lg: 1280,
      xl: 1920,
    },
  },
});

export default theme;
