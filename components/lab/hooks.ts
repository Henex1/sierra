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
  errorItem: {
    opacity: 0.5,
    pointerEvents: "none",
    paddingTop: 20,
    paddingBottom: 20,
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
    lineHeight: 1.25,
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
  executionScore: {
    width: 50,
    height: 50,
    fontSize: "20px",
    fontWeight: 700,
    color: "#fff",
  },
}));
