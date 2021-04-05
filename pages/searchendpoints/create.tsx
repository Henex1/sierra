import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import { ExposedSearchEndpoint } from "../../lib/searchendpoints";
import { authenticatedPage } from "../../lib/auth";
import Form from "../../components/searchendpoints/Form";

export const getServerSideProps = authenticatedPage();

export default function CreateSearchEndpoint() {
  const router = useRouter();
  async function onSubmit(values: ExposedSearchEndpoint) {
    const response = await fetch(`/api/searchendpoints`, {
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
    router.push("/searchendpoints");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <Container maxWidth="sm">
      <Form onSubmit={onSubmit} />
    </Container>
  );
}
