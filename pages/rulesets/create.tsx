import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import { ExposedRuleset } from "../../lib/rulesets";
import { authenticatedPage } from "../../lib/auth";
import { apiRequest } from "../../lib/api";
import Form from "../../components/rulesets/Form";

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
    <Container maxWidth="sm">
      <Form onSubmit={onSubmit} />
    </Container>
  );
}
