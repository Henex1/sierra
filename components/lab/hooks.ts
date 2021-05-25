import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  list: {
    margin: 0,
    padding: 0,
  },
  listItem: {
    borderBottom: "1px solid rgba(224, 224, 224, 1)",
    "$list li:last-child &": {
      borderBottom: "none",
    },
  },
  empty: {
    marginTop: theme.spacing(16),
    marginBottom: theme.spacing(16),
    textAlign: "center",
  },
  avatarBox: {
    minWidth: 76,
  },
  phrase: {
    display: "inline",
  },
  took: {
    marginLeft: theme.spacing(1),
  },
  fade: {
    opacity: 0.5,
  },
  scoreBoxAvatar: {
    width: 60,
    fontSize: "18px",
    color: "#111",
  },
}));
