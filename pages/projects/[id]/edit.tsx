import * as React from "react";
import Container from "@material-ui/core/Container";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import Form from "../../../components/projects/Form";
import { authenticatedPage } from "../../../lib/auth";
import {
  userCanAccessProject,
  formatProject,
  ExposedProject,
} from "../../../lib/projects";

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
    const { searchEndpointType, orgId, ...updateParams } = values;
    const response = await fetch(`/api/projects/update`, {
      method: "POST",
      body: JSON.stringify({ ...updateParams, id: project.id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.json();
    if (!response.ok) {
      // XXX - do something about this
      throw new Error(JSON.stringify(body));
    }
    router.push("/projects");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  async function onDelete() {
    const response = await fetch(`/api/projects/delete`, {
      method: "POST",
      body: JSON.stringify({ id: project.id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.json();
    if (!response.ok) {
      // XXX - do something about this
      throw new Error(JSON.stringify(body));
    }
    router.push("/projects");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <Container maxWidth="sm">
      <Form onSubmit={onSubmit} onDelete={onDelete} initialValues={project} />
    </Container>
  );
}
