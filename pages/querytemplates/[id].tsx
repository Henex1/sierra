import * as React from "react";
import { useRouter } from "next/router";

import Container from "@material-ui/core/Container";

import { apiRequest } from "../../lib/api";
import { authenticatedPage } from "../../lib/auth";
import { ExposedProject, formatProject, userCanAccessProject } from "../../lib/projects";
import {
  ExposedQueryTemplate,
  formatQueryTemplate,
  userCanAccessQueryTemplate,
} from "../../lib/querytemplates";
import prisma from "../../lib/prisma";

import Form from "../../components/querytemplates/Form";

export const getServerSideProps = authenticatedPage(async (context) => {
  const template = await prisma.queryTemplate.findFirst({
    where: userCanAccessQueryTemplate(context.user, {
      id: parseInt(context.params!.id! as string, 10),
    }),
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
      projects: projects.map(formatProject)
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
    <Container maxWidth="sm">
      <Form onSubmit={onSubmit} projects={projects} initialValues={template} />
    </Container>
  );
}
