import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(() => ({
  withLabel: {
    width: "fit-content",
  },
  title: {
    fontWeight: 500,
  },
  image: {
    maxWidth: 250,
    height: "auto",
  },
  popover: {
    height: 500,
    width: 500,
    padding: 10,
    overflow: "scroll",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));
