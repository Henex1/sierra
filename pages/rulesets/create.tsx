import * as React from "react";
import { useRouter } from "next/router";

import Container from "@material-ui/core/Container";
import { Typography } from "@material-ui/core";

import { ExposedRuleset } from "../../lib/rulesets";
import { authenticatedPage } from "../../lib/pageHelpers";
import { apiRequest } from "../../lib/api";
import Form from "../../components/rulesets/Form";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage();

export default function CreateRuleset() {
  const router = useRouter();
  async function onSubmit(values: ExposedRuleset) {
    await apiRequest(`/api/rulesets/create`, values);
    router.push("/rulesets");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/rulesets">Rulesets</Link>
        <Typography>New Ruleset</Typography>
      </BreadcrumbsButtons>
      <Container maxWidth="sm">
        <Form onSubmit={onSubmit} />
      </Container>
    </div>
  );
}
