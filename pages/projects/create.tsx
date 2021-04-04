import React from "react";
import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import { ExposedProject } from "../../lib/projects";
import { authenticatedPage } from "../../lib/auth";
import { useSession } from "../../components/Session";
import Form from "../../components/projects/Form";

export const getServerSideProps = authenticatedPage();

export default function CreateProject() {
  const router = useRouter();
  const { refresh: refreshSession } = useSession();

  const onSubmit = React.useCallback(
    async (values: ExposedProject) => {
      const response = await fetch(`/api/projects/create`, {
        method: "POST",
        body: JSON.stringify(values),
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
