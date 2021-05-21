import * as React from "react";

import { authenticatedPage, requireParam } from "../../lib/pageHelpers";
import {
  listQueryTemplates,
  ExposedQueryTemplate,
  formatQueryTemplate,
} from "../../lib/querytemplates";
import { getProject } from "../../lib/projects";
import { useTree, TreeView } from "../../components/common/TreeView";

export const getServerSideProps = authenticatedPage(async (context) => {
  const projectId = requireParam(context, "projectId");
  const project = await getProject(context.user, projectId);
  if (!project) {
    return { notFound: true };
  }
  const templates = await listQueryTemplates(project);
  return { props: { templates: templates.map(formatQueryTemplate) } };
});

type Props = {
  templates: ExposedQueryTemplate[];
};

export default function QueryTemplates({ templates }: Props) {
  const roots = useTree(
    templates,
    (t: ExposedQueryTemplate) => t.id,
    (t: ExposedQueryTemplate) => t.parentId
  );

  return (
    <TreeView
      roots={roots}
      renderItem={(t) => (
        <>
          {t.id} - {t.description}
        </>
      )}
    />
  );
}
