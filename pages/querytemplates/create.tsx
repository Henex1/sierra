import * as React from "react";
import { useRouter } from "next/router";

import { Typography } from "@material-ui/core";
import Container from "@material-ui/core/Container";

import { ExposedQueryTemplate } from "../../lib/querytemplates";
import { authenticatedPage } from "../../lib/auth";
import { apiRequest } from "../../lib/api";
import Form from "../../components/querytemplates/Form";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage();

export default function CreateRuleset() {
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
        <Form onSubmit={onSubmit} />
      </Container>
    </div>
  );
}
