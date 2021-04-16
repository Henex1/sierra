import * as React from "react";
import { useRouter } from "next/router";

import { Typography } from "@material-ui/core";
import Container from "@material-ui/core/Container";

import { authenticatedPage } from "../../lib/auth";
import {
  ExposedQueryTemplate,
  formatQueryTemplate,
  userCanAccessQueryTemplate,
} from "../../lib/querytemplates";
import Form from "../../components/querytemplates/Form";
import prisma from "../../lib/prisma";
import { apiRequest } from "../../lib/api";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const template = await prisma.queryTemplate.findFirst({
    where: userCanAccessQueryTemplate(context.user, {
      id: parseInt(context.params!.id! as string, 10),
    }),
  });
  if (!template) {
    return { notFound: true };
  }
  return {
    props: {
      template: formatQueryTemplate(template),
    },
  };
});

type Props = {
  template: ExposedQueryTemplate;
};

export default function EditQueryTemplate({ template }: Props) {
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
        <Form onSubmit={onSubmit} initialValues={template} />
      </Container>
    </div>
  );
}
