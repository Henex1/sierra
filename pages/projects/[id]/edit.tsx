import * as React from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

import Form from "../../../components/projects/Form";
import { authenticatedPage } from "../../../lib/auth";
import { apiRequest } from "../../../lib/api";
import {
  userCanAccessProject,
  formatProject,
  ExposedProject,
} from "../../../lib/projects";
import prisma from "../../../lib/prisma";
import Link from "../../../components/common/Link";
import BreadcrumbsButtons from "../../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const project = await prisma.project.findFirst({
    where: userCanAccessProject(context.user, {
      id: parseInt(context.params!.id! as string, 10),
    }),
  });
  if (!project) {
    return { notFound: true };
  }
  return { props: { project: formatProject(project) } };
});

type Props = {
  project: ExposedProject;
};

export default function EditProject({ project }: Props) {
  const router = useRouter();

  async function onSubmit(values: ExposedProject) {
    const { orgId, ...updateParams } = values;
    await apiRequest(`/api/projects/update`, {
      ...updateParams,
      id: project.id,
    });
    router.push("/projects");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  async function onDelete() {
    await apiRequest(`/api/projects/delete`, { id: project.id });
    router.push("/projects");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href={`/projects/${project.id}`}>{project.name}</Link>
        <Typography>Edit</Typography>
      </BreadcrumbsButtons>
      <Container maxWidth="sm">
        <Form onSubmit={onSubmit} onDelete={onDelete} initialValues={project} />
      </Container>
    </div>
  );
}
