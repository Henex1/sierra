import { makeStyles } from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  appBar: {
    backgroundColor: "#212952",
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarWrapper: {
    height: theme.spacing(8),
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(0, 1, 0, 2),
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(0, 5, 0, 3),
    },
  },
  leftWrapper: {
    display: "flex",
    alignItems: "center",
  },
  topButton: {
    textTransform: "capitalize",
  },
  dropMenu: {
    marginTop: theme.spacing(5),
  },
  rightWrapper: {
    display: "flex",
    alignItems: "center",
  },
  projectsFormControl: {
    marginLeft: theme.spacing(2),
    minWidth: 120,
  },
  selectLabel: {
    backgroundColor: "#212952",
    padding: "0 5px",
    "&.MuiFormLabel-root": {
      color: "white",
    },
    transform: "translate(14px, 13px) scale(1)",
    "&.Mui-focused": {
      color: "white",
    },
  },
  selectIcon: {
    color: "white",
  },
  headerLogo: {
    height: theme.spacing(3),
    padding: theme.spacing(0, 2, 0, 0),
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(0, 5, 0, 0),
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  sectionTablet: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  mobileProjectsSelection: {
    width: "115px",
    [theme.breakpoints.up("sm")]: {
      width: "250px",
    },
  },
}));
