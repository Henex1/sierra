import * as React from "react";
import { useRouter } from "next/router";

import { Container, Typography, Divider, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Form from "../../components/searchendpoints/Form";
import { authenticatedPage } from "../../lib/pageHelpers";
import { apiRequest } from "../../lib/api";
import {
  formatSearchEndpoint,
  getSearchEndpoint,
  ExposedSearchEndpoint,
} from "../../lib/searchendpoints";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const searchEndpoint = await getSearchEndpoint(
    context.user,
    context.params!.id as string
  );
  if (!searchEndpoint) {
    return { notFound: true };
  }
  return { props: { searchEndpoint: formatSearchEndpoint(searchEndpoint) } };
});

type Props = {
  searchEndpoint: ExposedSearchEndpoint;
};

const useStyles = makeStyles(() => ({
  wrapper: {
    height: "100%",
  },
}));

export default function EditSearchEndpoint({ searchEndpoint }: Props) {
  const [testResultModalOpen, setTestResultModalOpen] = React.useState(false);
  const [connectionTestResult, setConnectionTestResult] = React.useState({});

  const classes = useStyles();
  const router = useRouter();

  async function onSubmit(values: ExposedSearchEndpoint) {
    if (values.testConnection) {
      const { id, ...editableFields } = values;
      const result = await apiRequest(
        `/api/searchendpoints/connection`,
        editableFields,
        { method: "POST" }
      );
      setConnectionTestResult(result);
      setTestResultModalOpen(true);
      return false;
    }

    const { id, orgId, type, ...editableFields } = values;
    await apiRequest(
      `/api/searchendpoints/${searchEndpoint.id}`,
      editableFields,
      { method: "PATCH" }
    );
    router.push("/searchendpoints");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  async function onDelete() {
    await apiRequest(
      `/api/searchendpoints/${searchEndpoint.id}`,
      {},
      { method: "DELETE" }
    );
    router.push("/searchendpoints");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <div className={classes.wrapper}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/searchendpoints">Search Endpoints</Link>
        <Typography>{searchEndpoint.name}</Typography>
      </BreadcrumbsButtons>
      <Container maxWidth="sm">
        <Typography variant="h4">Update Search Endpoint</Typography>
        <Box mt={2} mb={4}>
          <Divider />
        </Box>
        <Form
          onSubmit={onSubmit}
          onDelete={onDelete}
          testResultModalOpen={testResultModalOpen}
          connectionTestResult={connectionTestResult}
          setTestResultModalOpen={setTestResultModalOpen}
          initialValues={searchEndpoint}
        />
      </Container>
    </div>
  );
}
