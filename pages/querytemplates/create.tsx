import * as React from "react";
import { useRouter } from "next/router";

import { Typography } from "@material-ui/core";
import Container from "@material-ui/core/Container";

import {
  ExposedProject,
  formatProject,
  userCanAccessProject,
} from "../../lib/projects";
import { ExposedQueryTemplate } from "../../lib/querytemplates";
import { authenticatedPage } from "../../lib/pageHelpers";
import { apiRequest } from "../../lib/api";
import prisma from "../../lib/prisma";

import Form from "../../components/querytemplates/Form";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const projects = await prisma.project.findMany({
    where: userCanAccessProject(context.user),
  });
  return { props: { projects: projects.map(formatProject) } };
});

type Props = {
  projects: ExposedProject[];
};

export default function CreateRuleset({ projects }: Props) {
  const router = useRouter();
  async function onSubmit(values: ExposedQueryTemplate) {
    await apiRequest(`/api/querytemplates/create`, values);
    router.push("/querytemplates");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/querytemplates">Query Templates</Link>
        <Typography>New Query Template</Typography>
      </BreadcrumbsButtons>
      <Container maxWidth="sm">
        <Form onSubmit={onSubmit} projects={projects} />
      </Container>
    </div>
  );
}
