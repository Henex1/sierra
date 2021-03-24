import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import { ExposedProject } from "../../lib/projects";
import { authenticatedPage } from "../../lib/auth";
import Form from "../../components/projects/Form";

export const getServerSideProps = authenticatedPage();

export default function CreateProject() {
  const router = useRouter();
  async function onSubmit(values: ExposedProject) {
    const response = await fetch(`/api/projects/mutations/create`, {
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
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <Container maxWidth="sm">
      <Form onSubmit={onSubmit} />
    </Container>
  );
}
