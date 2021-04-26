import * as React from "react";
import Container from "@material-ui/core/Container";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { authenticatedPage, requireNumberParam } from "../../lib/pageHelpers";
import { apiRequest } from "../../lib/api";
import {
  userCanAccessRuleset,
  formatRuleset,
  formatRulesetVersion,
  getRuleset,
  getLatestRulesetVersion,
  ExposedRuleset,
  ExposedRulesetVersion,
} from "../../lib/rulesets";
import { RulesetVersionValue } from "../../lib/rulesets/rules";
import RulesetEditor from "../../components/rulesets/RulesetEditor";

export const getServerSideProps = authenticatedPage(async (context) => {
  const id = requireNumberParam(context, "id");
  const ruleset = await getRuleset(context.user, id);
  if (!ruleset) {
    return { notFound: true };
  }
  let version = await getLatestRulesetVersion(ruleset);
  if (!version) {
    // Create a fake initial version
    version = {
      id: null as any,
      rulesetId: ruleset.id,
      parentId: null,
      value: { rules: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  return {
    props: {
      ruleset: formatRuleset(ruleset),
      version: formatRulesetVersion(version),
    },
  };
});

type Props = {
  ruleset: ExposedRuleset;
  version: ExposedRulesetVersion;
};

export default function EditRuleset({ ruleset, version }: Props) {
  const router = useRouter();

  async function onSubmit(value: RulesetVersionValue) {
    await apiRequest(`/api/rulesets/createVersion`, {
      value,
      rulesetId: ruleset.id,
      parentId: version.id,
    });
    router.push(router.asPath);
    return;
  }

  return (
    <RulesetEditor
      name={ruleset.name}
      onSubmit={onSubmit}
      initialValues={version.value as RulesetVersionValue}
    />
  );
}
