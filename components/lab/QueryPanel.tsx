import React from "react";
import {
  Grid,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Divider,
  makeStyles,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Form, Field } from "react-final-form";
import { OnChange } from "react-final-form-listeners";
import uniq from "lodash/uniq";
import { useRouter } from "next/router";

import { apiRequest } from "../../lib/api";
import { ExposedQueryTemplate } from "../../lib/querytemplates";
import JsonEditor from "../JsonEditor";
import ResizeObserver from "../common/Resizable";

const EDITOR_MIN_HEIGHT = 450;
const KNOB_DEFAULT_VALUE = 10;

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

type Props = {
  queryTemplate: ExposedQueryTemplate;
  formId: string;
  onUpdate: (id: number) => void;
};

export default function QueryTemplateEditor({
  queryTemplate,
  formId,
  onUpdate,
}: Props) {
  const classes = useStyles();
  const router = useRouter();

  async function onSubmit(value: ExposedQueryTemplate) {
    const newQueryTemplates: {
      queryTemplate: ExposedQueryTemplate;
    } = await apiRequest(`/api/querytemplates/update`, {
      parentId: queryTemplate.id,
      description: queryTemplate.description || "",
      tag: queryTemplate.tag || "",
      projectId: queryTemplate.projectId,
      query: value.query,
      knobs: value.knobs
        ? Object.entries(value.knobs).reduce(
            (result: { [key: string]: number }, item) => {
              result[item[0]] = parseFloat(item[1]) || 10;
              return result;
            },
            {}
          )
        : {},
    });
    await onUpdate(newQueryTemplates.queryTemplate.id);
    router.replace(router.asPath);
    return Promise.resolve();
  }

  return (
    <Form
      initialValues={{
        ...queryTemplate,
        query: prettifyQuery(queryTemplate.query),
      }}
      onSubmit={onSubmit}
      render={({ handleSubmit, form, submitting, values }) => (
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
            {(value) => {
              const oldKnobs = values.knobs;
              const newKnobs: { [key: string]: any } = {};
              const newKnobsVars = extract(value);
              newKnobsVars.forEach((varName) => {
                // @ts-ignore
                newKnobs[varName] = oldKnobs[varName] || KNOB_DEFAULT_VALUE;
              });
              form.change("knobs", newKnobs);
            }}
          </OnChange>
          <Accordion
            classes={{
              root: classes.accordion,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
              classes={{
                root: classes.accordionSummary,
                expanded: classes.accordionSummaryExpanded,
                content: classes.accordionSummaryContent,
              }}
            >
              <Typography variant="h6">Knobs</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Box width="100%">
                {values.knobs && Object.entries(values.knobs).length > 0 ? (
                  Object.entries(values.knobs).map(([knobKey, knobVal], i) => (
                    <React.Fragment key={i}>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs>
                          <Typography component="label" id={"knob-" + i}>
                            {knobKey}
                          </Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Field name={`knobs.${knobKey}`}>
                            {({ input }) => (
                              <TextField
                                value={input.value}
                                variant="outlined"
                                size="small"
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  const value = e.target.value.replace(
                                    /[^0-9-]+/g,
                                    ""
                                  );
                                  if (value === "") {
                                    // hack, for some reason rff removes
                                    // knobs with empty string value
                                    input.onChange(" ");
                                  } else {
                                    input.onChange(value.trim());
                                  }
                                }}
                                error={
                                  !input.value ||
                                  input.value === " " ||
                                  (typeof input.value === "string" &&
                                    input.value?.trim() === "-")
                                }
                              />
                            )}
                          </Field>
                        </Grid>
                      </Grid>
                      <Box my={1}>
                        <Divider />
                      </Box>
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="subtitle2" color="textSecondary">
                    Add variables in your query above using keywords enclosed by
                    `##` such as `##brand_match_boost##` to use tuning knobs.
                  </Typography>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        </form>
      )}
    />
  );
}

function extractParam(match: string) {
  const paramSingle = /##([^#]*)##/;
  const matchedParam = paramSingle.exec(match);
  if (matchedParam && matchedParam.length >= 2) {
    return matchedParam[1];
  } else {
    return null;
  }
}

function extract(query: string) {
  let varNames: string[] = [];

  // strip query var
  const strippedQuery = query.replace(/##\$query##/g, "");

  const varsRegex = /##[^#]*?##/g;
  const matches = strippedQuery.match(varsRegex);

  if (matches) {
    matches.forEach((match) => {
      const varName = extractParam(match);
      if (varName) {
        varNames.push(varName);
      }
    });
  }
  return uniq(varNames).sort((a, b) => a.localeCompare(b));
}

function prettifyQuery(query: string) {
  try {
    return JSON.stringify(JSON.parse(query), null, 2);
  } catch (err) {
    return query;
  }
}
