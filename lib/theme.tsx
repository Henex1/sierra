import { createMuiTheme } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";

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
});

export default theme;
