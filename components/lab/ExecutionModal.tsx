import React from "react";
import { Grid, Typography } from "@material-ui/core";

import { ExposedQueryTemplate } from "../../lib/querytemplates";
import { ExposedRulesetVersion } from "../../lib/rulesets";
import { useTree, TreeView } from "../common/TreeView";
import { useLabContext } from "../../utils/react/hooks/useLabContext";

type Props = {
  templates: ExposedQueryTemplate[];
};

export default function ExecutionModal({ templates }: Props) {
  const { rulesets } = useLabContext();
  const roots = useTree(
    templates,
    (t: ExposedQueryTemplate) => t.id,
    (t: ExposedQueryTemplate) => t.parentId
  );

  return (
    <Grid container spacing={2}>
      <Grid item lg={6}>
        <Typography variant="h6">Query Templates</Typography>
        <TreeView
          roots={roots}
          renderItem={(t) => (
            <Typography color="textPrimary">
              {t.id + " - " + t.description}
            </Typography>
          )}
        />
      </Grid>
      <Grid item lg={6}>
        <Typography variant="h6">Rulesets</Typography>
        {rulesets.map((item) => (
          <RulesetTreeView
            key={item.id}
            rulesetVersions={item.rulesetVersions}
          />
        ))}
      </Grid>
    </Grid>
  );
}

const RulesetTreeView = ({
  rulesetVersions,
}: {
  rulesetVersions: ExposedRulesetVersion[];
}) => {
  const roots = useTree(
    rulesetVersions,
    (t: ExposedRulesetVersion) => t.id,
    (t: ExposedRulesetVersion) => t.parentId
  );

  return (
    <TreeView
      roots={roots}
      renderItem={(t) => <Typography color="textPrimary">{t.id}</Typography>}
    />
  );
};
