import { makeStyles } from "@material-ui/core/styles";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

const label: CSSProperties = {
  fontWeight: "bold",
};

export const useTextareaStyles = makeStyles({
  input: {
    fontSize: "12px",
  },
});

export const useFeedbackStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateAreas: `"title close"
                        "type type"
                        "error error"
                        "form form"`,
    gridTemplateColumns: "1fr auto",
    gridGap: "15px",
    width: "400px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
    gridArea: "title",
  },
  close: {
    gridArea: "close",
    cursor: "pointer",
    fontSize: "14px",
    color: "#888",
    alignSelf: "center",
  },
  type: {
    gridArea: "type",
    justifyContent: "center",
    gridColumn: "1/3",
  },
  error: {
    gridArea: "error",
    gridColumn: "1/3",
  },
  form: {
    gridArea: "form",
    gridColumn: "1/3",
  },
});

export const useRatingStyles = makeStyles({
  root: {
    display: "grid",
    gridGap: "5px",
  },
  label,
  stars: {
    margin: "auto",
  },
});
