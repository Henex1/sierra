import * as React from "react";
import { useRouter } from "next/router";

import { authenticatedPage } from "../../lib/auth";
import {
  ExposedQueryTemplate,
  formatQueryTemplate,
  userCanAccessQueryTemplate,
} from "../../lib/querytemplates";
import Container from "@material-ui/core/Container";
import Form from "../../components/querytemplates/Form";
import prisma from "../../lib/prisma";
import { apiRequest } from "../../lib/api";

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
    <Container maxWidth="sm">
      <Form onSubmit={onSubmit} initialValues={template} />
    </Container>
  );
}
