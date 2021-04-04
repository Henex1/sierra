import * as React from "react";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { GetServerSideProps } from "next";

import { LinkButton } from "../../../components/common/Link";
import Form from "../../../components/projects/Form";
import DebugQuery from "../../../components/datasources/DebugQuery";
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

export default function ViewProject({ project }: Props) {
  return (
    <Container>
      <Box pb={2}>
        <LinkButton href={`/projects/${project.id}/edit`} variant="contained">
          Edit Project
        </LinkButton>
      </Box>
      <Typography variant="h3">Project: {project.name}</Typography>
      <DebugQuery />
    </Container>
  );
}
