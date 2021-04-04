import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import { ExposedRuleset } from "../../lib/rulesets";
import { authenticatedPage } from "../../lib/auth";
import Form from "../../components/rulesets/Form";

export const getServerSideProps = authenticatedPage();

export default function CreateRuleset() {
  const router = useRouter();
  async function onSubmit(values: ExposedRuleset) {
    const response = await fetch(`/api/rulesets/create`, {
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
    router.push("/rulesets");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <Container maxWidth="sm">
      <Form onSubmit={onSubmit} />
    </Container>
  );
}
