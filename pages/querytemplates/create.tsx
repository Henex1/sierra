import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import { ExposedQueryTemplate } from "../../lib/querytemplates";
import { authenticatedPage } from "../../lib/auth";
import { apiRequest } from "../../lib/api";
import Form from "../../components/querytemplates/Form";

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
    <Container maxWidth="sm">
      <Form onSubmit={onSubmit} />
    </Container>
  );
}
