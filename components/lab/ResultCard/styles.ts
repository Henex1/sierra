import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles(() => ({
  titleAndImageWrapper: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    maxWidth: 275,
    fontWeight: 600,
    fontSize: "20px",
    lineHeight: "25px",
  },
  imageContainer: {
    alignSelf: "flex-start",
  },
  image: {
    maxWidth: 80,
    height: "auto",
    marginRight: 15,
    border: "1px solid #dfdfdf",
    borderRadius: 5,
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
