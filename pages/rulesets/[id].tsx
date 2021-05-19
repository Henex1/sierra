import * as React from "react";
import { useRouter } from "next/router";
import { Typography } from "@material-ui/core";

import { getRulesetEditorProps } from "../api/rulesets/[id]";
import { authenticatedPage, requireParam } from "lib/pageHelpers";
import { apiRequest } from "lib/api";
import { ExposedRuleset, ExposedRulesetVersion } from "../../lib/rulesets";
import { RulesetVersionValue } from "../../lib/rulesets/rules";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";
import RulesetEditor from "../../components/rulesets/RulesetEditor";

export const getServerSideProps = authenticatedPage(async (context) => {
  const id = requireParam(context, "id");
  const props = await getRulesetEditorProps(id, context.user);
  if (props.notFound) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...props,
    },
  };
});

export type Props = {
  ruleset: ExposedRuleset;
  version: ExposedRulesetVersion;
  facetFilterFields: string[];
};

export default function EditRuleset({
  ruleset,
  version,
  facetFilterFields,
}: Props) {
  const router = useRouter();

  async function onSubmit(value: RulesetVersionValue) {
    if (!value.conditions) value.conditions = [];
    if (!value.rules) value.rules = [];
    await apiRequest(`/api/rulesets/createVersion`, {
      value,
      rulesetId: ruleset.id,
      parentId: version.id,
    });
    router.push(router.asPath);
    return;
  }

  return (
    <>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/rulesets">Rulesets</Link>
        <Typography>{ruleset.name}</Typography>
      </BreadcrumbsButtons>
      <RulesetEditor
        onSubmit={onSubmit}
        initialValues={version.value as RulesetVersionValue}
        facetFilterFields={facetFilterFields}
      />
    </>
  );
}
