import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import { ExposedDatasource } from "../../lib/datasources";
import Form from "../../components/datasources/Form";

export default function CreateDatasource() {
  const router = useRouter();
  async function onSubmit(values: ExposedDatasource) {
    const response = await fetch(`/api/datasources`, {
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
    router.push("/datasources");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <Container maxWidth="sm">
      <Form onSubmit={onSubmit} />
    </Container>
  );
}
