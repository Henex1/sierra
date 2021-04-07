import Container from "@material-ui/core/Container";
import { useRouter } from "next/router";

import { ExposedSearchEndpoint } from "../../lib/searchendpoints";
import { authenticatedPage } from "../../lib/auth";
import { apiRequest } from "../../lib/api";
import Form from "../../components/searchendpoints/Form";

export const getServerSideProps = authenticatedPage();

export default function CreateSearchEndpoint() {
  const router = useRouter();
  async function onSubmit(values: ExposedSearchEndpoint) {
    await apiRequest(`/api/searchendpoints`, values);
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
