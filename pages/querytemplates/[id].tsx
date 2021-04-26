import * as React from "react";
import { useRouter } from "next/router";

import { Typography } from "@material-ui/core";
import Container from "@material-ui/core/Container";

import { apiRequest } from "../../lib/api";
import { authenticatedPage, requireNumberParam } from "../../lib/pageHelpers";
import {
  ExposedProject,
  formatProject,
  userCanAccessProject,
} from "../../lib/projects";
import {
  ExposedQueryTemplate,
  formatQueryTemplate,
  userCanAccessQueryTemplate,
} from "../../lib/querytemplates";
import prisma from "../../lib/prisma";

import Form from "../../components/querytemplates/Form";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const id = requireNumberParam(context, "id");
  const template = await prisma.queryTemplate.findFirst({
    where: userCanAccessQueryTemplate(context.user, { id }),
  });
  const projects = await prisma.project.findMany({
    where: userCanAccessProject(context.user),
  });
  if (!template) {
    return { notFound: true };
  }
  return {
    props: {
      template: formatQueryTemplate(template),
      projects: projects.map(formatProject),
    },
  };
});

type Props = {
  template: ExposedQueryTemplate;
  projects: ExposedProject[];
};

export default function EditQueryTemplate({ template, projects }: Props) {
  const router = useRouter();

  async function onSubmit(value: ExposedQueryTemplate) {
    await apiRequest(`/api/querytemplates/update`, {
      id: template.id,
      description: value.description,
      query: value.query,
      tag: value.tag,
      projectId: value.projectId,
      knobs: value.knobs,
    });
    router.push("/querytemplates");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/querytemplates">Query Templates</Link>
        <Typography>{template.description}</Typography>
      </BreadcrumbsButtons>
      <Container maxWidth="sm">
        <Form
          onSubmit={onSubmit}
          projects={projects}
          initialValues={template}
        />
      </Container>
    </div>
  );
}
