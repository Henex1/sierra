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
    return {notFound: true};
  }
  let version = await getLatestRulesetVersion(ruleset);
  if (!version) {
    // Create a fake initial version
    version = {
      id: null as any,
      rulesetId: ruleset.id,
      parentId: null,
      value: {rules: []},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  const mockedFacetFilterFields = {
    "fields": {
      "rating": {
        "long": {
          "searchable": true,
          "aggregatable": false,
          "indices": ["index1", "index2"],
          "non_aggregatable_indices": ["index1"]
        },
        "keyword": {
          "searchable": false,
          "aggregatable": true,
          "indices": ["index3", "index4"],
          "non_searchable_indices": ["index4"]
        },
        "unmapped": {
          "indices": ["index5"],
          "searchable": false,
          "aggregatable": false
        }
      },
      "title": {
        "text": {
          "indices": ["index1", "index2", "index3", "index4"],
          "searchable": true,
          "aggregatable": false
        },
        "unmapped": {
          "indices": ["index5"],
          "searchable": false,
          "aggregatable": false
        }
      }
    }
  }

  return {
    props: {
      ruleset: formatRuleset(ruleset),
      version: formatRulesetVersion(version),
      facetFilterFields: mockedFacetFilterFields,
    },
  };
});

type Props = {
  ruleset: ExposedRuleset;
  version: ExposedRulesetVersion;
  facetFilterFields: object;
};

export default function EditRuleset({ ruleset, version, facetFilterFields }: Props) {
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
      facetFilterFields={facetFilterFields}
    />
  );
}
