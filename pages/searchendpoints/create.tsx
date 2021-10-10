import * as React from "react";
import { useRouter } from "next/router";

import { Typography, Container, Box, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { ExposedSearchEndpoint } from "../../lib/searchendpoints/types/ExposedSearchEndpoint";
import { authenticatedPage } from "../../lib/pageHelpers";
import { apiRequest } from "../../lib/api";
import Form, { FormValues } from "../../components/searchendpoints/Form";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage();

const useStyles = makeStyles(() => ({
  wrapper: {
    height: "100%",
  },
}));

const initialValues: Partial<FormValues> = {
  info: {
    endpoint: "",
    index: "",
  },
  resultId: "_id",
};

export default function CreateSearchEndpoint() {
  const [testResultModalOpen, setTestResultModalOpen] = React.useState(false);
  const [connectionTestResult, setConnectionTestResult] = React.useState<
    { success: boolean; title: string; message: string } | undefined
  >();
  const classes = useStyles();
  const router = useRouter();

  async function onSubmit(values: ExposedSearchEndpoint) {
    if (values.testConnection) {
      const newSearchEndpoint = {
        ...values,
        displayFields: values.displayFields ? values.displayFields : [],
        description: values.description ? values.description : "",
      };

      const result = await apiRequest(
        `/api/searchendpoints/connection`,
        newSearchEndpoint,
        { method: "POST" }
      );
      setConnectionTestResult({
        success: result.success,
        title: `Connection ${result.success ? "successful" : "failed"}`,
        message: result.message,
      });
      setTestResultModalOpen(true);
      return false;
    } else {
      await create(values);
      router.push("/searchendpoints");
      // Keep the form stuck as pending
      return new Promise(() => {});
    }
  }

  return (
    <div className={classes.wrapper}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/searchendpoints">Search Endpoints</Link>
        <Typography>New Search Endpoint</Typography>
      </BreadcrumbsButtons>
      <Container maxWidth="sm">
        <Typography variant="h4">Create Search Endpoint</Typography>
        <Box mt={2} mb={4}>
          <Divider />
        </Box>
        <Form
          onSubmit={onSubmit}
          resultModalOpen={testResultModalOpen}
          resultMessage={connectionTestResult}
          setResultModalOpen={setTestResultModalOpen}
          initialValues={initialValues}
        />
      </Container>
    </div>
  );
}

export async function create(values: ExposedSearchEndpoint) {
  const newSearchEndpoint = {
    ...values,
    displayFields: values.displayFields ? values.displayFields : [],
    description: values.description ? values.description : "",
  };
  return await apiRequest(`/api/searchendpoints`, newSearchEndpoint);
}
