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
    padding: theme.spacing(0, 5, 0, 3),
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
    padding: theme.spacing(0, 5, 0, 0),
  },
}));
