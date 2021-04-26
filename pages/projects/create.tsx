import React from "react";
import { useRouter } from "next/router";

import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

import { ExposedProject } from "../../lib/projects";
import {
  ExposedSearchEndpoint,
  listSearchEndpoints,
} from "../../lib/searchendpoints";
import { authenticatedPage } from "../../lib/pageHelpers";
import { apiRequest } from "../../lib/api";
import { useSession } from "../../components/Session";
import Form from "../../components/projects/Form";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const searchEndpoints = await listSearchEndpoints(context);
  return { props: { searchEndpoints } };
});

type Props = {
  searchEndpoints: ExposedSearchEndpoint[];
};

export default function CreateProject({ searchEndpoints }: Props) {
  const router = useRouter();
  const { refresh: refreshSession } = useSession();

  const onSubmit = React.useCallback(
    async (values: ExposedProject) => {
      await apiRequest(`/api/projects/create`, values);
      router.push("/projects");
      // Reload the global projects list dropdown
      refreshSession();
      // Keep the form stuck as pending
      return new Promise(() => {});
    },
    [refreshSession]
  );

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Typography>New Project</Typography>
      </BreadcrumbsButtons>
      <Container maxWidth="sm">
        <Form onSubmit={onSubmit} endpoints={searchEndpoints} />
      </Container>
    </div>
  );
}
