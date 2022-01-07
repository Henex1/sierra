import React from "react";
import _ from "lodash";
import { Grid, Box, TextField, makeStyles } from "@material-ui/core";
import { Form, Field, FormSpy } from "react-final-form";
import queryString from "querystring";

import { ExposedQueryTemplate } from "../../../lib/querytemplates";

import FqList from "./FqList";
import OnValueChange from "./OnValueChange";
import SolrField, { Props as SolrFieldProps } from "./SolrField";
import Knobs from "./Knobs";

type Props = {
  formId: string;
  queryTemplate:
    | ExposedQueryTemplate
    | Pick<ExposedQueryTemplate, "query" | "knobs">;
  onSubmit: (value: {
    query: string;
    knobs: { [name: string]: any };
  }) => Promise<void>;
  onQueryChange: (form: any, values: any, query: string) => void;
};

export const FIELD_NAME_DOT_REPLACEMENT = "/";

const dismaxEdismaxFields = [
  { field: "q.alt", label: "Alternative Query (q.alt)" },
  { field: "qf", label: "Query Fields (qf)" },
  { field: "mm", label: "Minimum Should Match (mm)" },
  { field: "pf", label: "Phrase Fields (pf)" },
  { field: "ps", label: "Phrase Slop (ps)" },
  { field: "qs", label: "Query Phrase Slop (qs)" },
  { field: "tie", label: "Tie Breaker (tie)" },
  { field: "bq", label: "Boost Query (bq)" },
  { field: "bf", label: "Boost Functions (bf)" },
];

const edismaxFields = [
  { field: "uf", label: "uf" },
  { field: "pf2", label: "pf2" },
  { field: "pf3", label: "pf3" },
  { field: "ps2", label: "ps2" },
  { field: "ps3", label: "ps3" },
  { field: "boost", label: "boost" },
];

const collapsableFields: SolrFieldProps[] = [
  {
    checkbox: true,
    field: "hl",
    label: "Highlighting (hl)",
    nestedFields: [
      {
        field: "hl.fl",
        label: "Fields to highlight (hl.fl)",
      },
      {
        field: "hl.simple.pre",
      },
      {
        field: "hl.simple.post",
      },
      {
        checkbox: true,
        field: "hl.requireFieldMatch",
      },
      {
        checkbox: true,
        field: "hl.usePhraseHighlighter",
      },
      {
        checkbox: true,
        field: "hl.highlightMultiTerm",
      },
    ],
  },
  {
    checkbox: true,
    field: "facet",
    nestedFields: [
      {
        field: "facet.query",
      },
      {
        field: "facet.field",
      },
      {
        field: "facet.prefix",
      },
      {
        field: "facet.contains",
      },
      {
        checkbox: true,
        field: "facet.contains.ignoreCase",
      },
      {
        field: "facet.limit",
      },
      {
        field: "facet.matches",
      },
      {
        field: "facet.sort",
        items: ["count", "index"],
      },
      {
        field: "facet.mincount",
        type: "number",
      },
      {
        checkbox: true,
        field: "facet.missing",
      },
    ],
  },
  {
    checkbox: true,
    field: "spatial",
    nestedFields: [
      {
        field: "pt",
      },
      {
        field: "sfield",
      },
      {
        field: "d",
      },
    ],
  },
  {
    checkbox: true,
    field: "spellcheck",
    nestedFields: [
      {
        checkbox: true,
        field: "spellcheck.build",
      },
      {
        checkbox: true,
        field: "spellcheck.reload",
      },
      {
        field: "spellcheck.q",
      },
      {
        field: "spellcheck.dictionary",
      },
      {
        field: "spellcheck.count",
      },
      {
        checkbox: true,
        field: "spellcheck.onlyMorePopular",
      },
      {
        checkbox: true,
        field: "spellcheck.extendedResults",
      },
      {
        checkbox: true,
        field: "spellcheck.collate",
      },
      {
        field: "spellcheck.maxCollations",
      },
      {
        field: "spellcheck.maxCollationTries",
      },
      {
        field: "spellcheck.accuracy",
      },
    ],
  },
];

export default function SolrQueryPanel(props: Props) {
  const { queryTemplate, formId, onSubmit, onQueryChange } = props;
  const classes = useStyles();

  let parsedQuery;
  try {
    parsedQuery = deserializeQuery(queryTemplate?.query ?? "");
  } catch (err) {
    parsedQuery = {};
  }

  const debouncedOnQueryChange = _.debounce(
    (form: any, values: any, query: string) =>
      onQueryChange(form, values, query),
    250
  );

  const onSubmitQuery = (values: any) =>
    onSubmit({
      query: serializeQuery(values),
      knobs: values.knobs,
    });

  return (
    <Form
      initialValues={{ ...parsedQuery, knobs: queryTemplate.knobs }}
      onSubmit={onSubmitQuery}
      render={({ handleSubmit, form, values }) => (
        <form id={formId} onSubmit={handleSubmit} className={classes.form}>
          <OnValueChange value={serializeQuery(values)} name="query">
            {(query: string) => debouncedOnQueryChange(form, values, query)}
          </OnValueChange>

          <FormSpy>
            {(props: any) => (
              <Box mb={2}>
                <TextField
                  fullWidth
                  multiline
                  label="Raw Query Parameters"
                  value={serializeQuery(props.values)}
                  onChange={(ev) => {
                    try {
                      props.form.reset(deserializeQuery(ev.target.value));
                    } catch (err) {
                      // ignore
                    }
                  }}
                />
              </Box>
            )}
          </FormSpy>
          <SolrField field="qt" label="Request-Handler (qt)" />
          <SolrField field="q" />
          <SolrField field="q.op" items={["OR", "AND"]} />
          <Field name="fq">
            {({ input }) => (
              <FqList value={input.value} onChange={input.onChange} />
            )}
          </Field>
          <SolrField field="sort" />
          <Grid container>
            <Grid item xs={6}>
              <Box pr={1}>
                <SolrField field="start" type="number" />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <SolrField field="rows" type="number" />
            </Grid>
          </Grid>
          <SolrField field="fl" label="Field List (fl)" />
          <SolrField field="df" label="Default Field (df)" />
          <SolrField field="defType" items={["lucene", "dismax", "edismax"]} />
          <FormSpy>
            {(props) =>
              ["dismax", "edismax"].indexOf(props.values.defType) > -1 && (
                <>
                  {dismaxEdismaxFields.map((it: SolrFieldProps, i: number) => (
                    <SolrField key={i} {...it} />
                  ))}
                  {props.values.defType === "edismax" &&
                    edismaxFields.map((it: SolrFieldProps, i: number) => (
                      <SolrField key={i} {...it} />
                    ))}
                </>
              )
            }
          </FormSpy>
          <SolrField checkbox={true} field="stopwords" />
          <SolrField checkbox={true} field="lowercaseOperators" />
          {collapsableFields.map((it: SolrFieldProps, i: number) => (
            <SolrField key={i} {...it} />
          ))}
          <Knobs values={values} />
        </form>
      )}
    />
  );
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

function serializeQuery(values: { [key: string]: any }) {
  return decodeURIComponent(
    queryString.stringify(
      _.fromPairs(
        _.toPairs(
          _.mapKeys(values, (val, key) =>
            key.replaceAll(FIELD_NAME_DOT_REPLACEMENT, ".")
          )
        ).filter((it) => it[0] !== "knobs")
      )
    )
  );
}

function deserializeQuery(qs: string) {
  const parsed = queryString.parse(qs);
  return _.mapKeys(parsed, (val, key) =>
    key.replaceAll(".", FIELD_NAME_DOT_REPLACEMENT)
  );
}
