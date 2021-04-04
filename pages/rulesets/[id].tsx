import * as React from "react";
import Container from "@material-ui/core/Container";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { authenticatedPage } from "../../lib/auth";
import {
  userCanAccessRuleset,
  formatRuleset,
  formatRulesetVersion,
  ExposedRuleset,
  ExposedRulesetVersion,
  RulesetVersionValue,
} from "../../lib/rulesets";
import RulesetEditor from "../../components/rulesets/RulesetEditor";

export const getServerSideProps = authenticatedPage(async (context) => {
  const ruleset = await prisma.ruleset.findFirst({
    where: userCanAccessRuleset(context.user, {
      id: parseInt(context.params!.id! as string, 10),
    }),
  });
  if (!ruleset) {
    return { notFound: true };
  }
  let version = await prisma.rulesetVersion.findFirst({
    where: { ruleset: { id: ruleset.id } },
    orderBy: [{ updatedAt: "desc" }],
  });
  if (!version) {
    // Create a fake initial version
    version = {
      id: null,
      rulesetId: ruleset.id,
      parentId: null,
      value: { rules: [] },
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
    const response = await fetch(`/api/rulesets/newVersion`, {
      method: "POST",
      body: JSON.stringify({
        value,
        rulesetId: ruleset.id,
        parentId: version.id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.json();
    if (!response.ok) {
      // XXX - do something about this
      throw new Error(JSON.stringify(body));
    }
    router.push("/rulesets");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return <RulesetEditor onSubmit={onSubmit} initialValues={version.value} />;
}
