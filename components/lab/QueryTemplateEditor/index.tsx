import React from "react";
import _ from "lodash";
import { useRouter } from "next/router";

import { ExposedQueryTemplate } from "../../../lib/querytemplates";
import ElasticQueryPanel from "./ElasticQueryPanel";
import SolrQueryPanel from "./SolrQueryPanel";

const KNOB_DEFAULT_VALUE = 10;

type Props = {
  queryTemplate:
    | ExposedQueryTemplate
    | Pick<ExposedQueryTemplate, "query" | "knobs">;
  formId: string;
  searchEndpointType: string;
  onUpdate?: (id: string) => void;
  onFormValuesChange: (data: QueryPanelValues) => void;
  updateQueryTemplate?: (
    data: QueryPanelValues
  ) => Promise<{ queryTemplate: ExposedQueryTemplate }>;
};

export type QueryPanelValues = {
  query: string;
  knobs: { [key: string]: any };
};

export const QueryTemplateEditor = (props: Props) => {
  const {
    queryTemplate,
    formId,
    searchEndpointType,
    onUpdate,
    onFormValuesChange,
    updateQueryTemplate,
  } = props;

  const router = useRouter();

  const onQueryChange = (form: any, values: any, query: string) => {
    const oldKnobs = values.knobs as Record<string, unknown>;
    const newKnobs: { [key: string]: any } = {};
    const newKnobsVars = extract(query);
    newKnobsVars.forEach((varName: any) => {
      newKnobs[varName] = oldKnobs[varName] || KNOB_DEFAULT_VALUE;
    });

    // Pass changed knobs to parent
    onFormValuesChange({ query, knobs: newKnobs });

    // Change form knobs value
    form.change("knobs", newKnobs);
  };

  async function onSubmit(value: { query: string; knobs: any }) {
    if (!onUpdate || !updateQueryTemplate) return;

    const newQueryTemplates = await updateQueryTemplate({
      query: value.query,
      knobs: value.knobs as Record<string, undefined>,
    });

    await onUpdate(newQueryTemplates.queryTemplate.id);
    router.replace(router.asPath);
  }

  const panelProps = {
    formId,
    queryTemplate,
    onSubmit,
    onQueryChange,
  };

  if (searchEndpointType === "SOLR") {
    return <SolrQueryPanel {...panelProps} />;
  }

  return <ElasticQueryPanel {...panelProps} />;
};

function extractParam(match: string) {
  const paramSingle = /##([^#|$]*)##/;
  const matchedParam = paramSingle.exec(match);
  if (matchedParam && matchedParam.length >= 2) {
    return matchedParam[1];
  }
  return null;
}

function extract(query: string) {
  const varNames: string[] = [];

  // strip query var
  const strippedQuery = query.replace(/#\$query#/g, "");

  const varsRegex = /##[^#|$]*?##/g;
  const matches = strippedQuery.match(varsRegex);

  if (matches) {
    matches.forEach((match) => {
      const varName = extractParam(match);
      if (varName) {
        varNames.push(varName);
      }
    });
  }
  return _.uniq(varNames).sort((a, b) => a.localeCompare(b));
}
