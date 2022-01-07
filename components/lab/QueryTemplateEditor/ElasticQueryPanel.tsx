import React from "react";
import { makeStyles } from "@material-ui/core";
import { Form, Field } from "react-final-form";
import { OnChange } from "react-final-form-listeners";

import Knobs from "./Knobs";
import { ExposedQueryTemplate } from "../../../lib/querytemplates";
import JsonEditor from "../../JsonEditor";
import ResizeObserver from "../../common/Resizable";

const EDITOR_MIN_HEIGHT = 450;

type Props = {
  formId: string;
  queryTemplate: ExposedQueryTemplate | Pick<ExposedQueryTemplate, "query">;
  onSubmit: (value: ExposedQueryTemplate) => Promise<void>;
  onQueryChange: (form: any, values: any, query: string) => void;
};

export default function ElasticQueryPanel({
  queryTemplate,
  formId,
  onSubmit,
  onQueryChange,
}: Props) {
  const classes = useStyles();

  return (
    <Form
      initialValues={{
        ...queryTemplate,
        query: prettifyQuery(queryTemplate.query),
      }}
      onSubmit={onSubmit}
      render={({ handleSubmit, form, values }) => {
        return (
          <form id={formId} onSubmit={handleSubmit} className={classes.form}>
            <div className={classes.editorWrapper}>
              <ResizeObserver className={classes.editor}>
                {({ height }) => (
                  <Field name="query">
                    {({ input }) => (
                      <JsonEditor
                        value={input.value}
                        onChange={input.onChange}
                        height={Math.max(EDITOR_MIN_HEIGHT, height)}
                      />
                    )}
                  </Field>
                )}
              </ResizeObserver>
            </div>
            <OnChange name="query">
              {(query: string) => onQueryChange(form, values, query)}
            </OnChange>
            <Knobs values={values} />
          </form>
        );
      }}
    />
  );
}

function prettifyQuery(query: string) {
  try {
    return JSON.stringify(JSON.parse(query), null, 2);
  } catch (err) {
    return query;
  }
}

const useStyles = makeStyles((theme) => ({
  form: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    height: "100%",
  },
  label: {
    marginBottom: theme.spacing(1),
  },
  editorWrapper: {
    position: "relative",
    flexGrow: 1,
    flexShrink: 0,
    height: "100%",
    minHeight: EDITOR_MIN_HEIGHT,
    marginBottom: theme.spacing(2),
  },
  editor: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  accordion: {
    boxShadow: "none",
    "&:before": {
      display: "none",
    },
  },
  accordionSummary: {
    minHeight: 48,
    padding: 0,
    border: "none",
    "&$accordionSummaryExpanded": {
      minHeight: 48,
    },
  },
  accordionSummaryExpanded: {
    "& $accordionSummaryContent": {
      margin: 0,
    },
  },
  accordionSummaryContent: {
    margin: 0,
  },
  accordionDetails: {
    padding: theme.spacing(1, 0),
  },
  knobInput: {
    font: "inherit",
    fontSize: 16,
    lineHeight: "inherit",
    width: "100%",
    height: 40,
    padding: theme.spacing(1, 1.5),
    border: "1px solid rgba(0, 0, 0, 0.23)",
    borderRadius: theme.shape.borderRadius,
    "&:focus": {
      outlineColor: theme.palette.primary.main,
    },
  },
}));
