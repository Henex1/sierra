import React from "react";
import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import { ExposedProject } from "../../lib/projects";
import { authenticatedPage } from "../../lib/auth";
import { apiRequest } from "../../lib/api";
import { useSession } from "../../components/Session";
import Form from "../../components/projects/Form";

export const getServerSideProps = authenticatedPage();

export default function CreateProject() {
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
    <Container maxWidth="sm">
      <Form onSubmit={onSubmit} />
    </Container>
  );
}
