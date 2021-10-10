import * as React from "react";
import { useRouter } from "next/router";
import * as Z from "zod";

import { Container, Typography, Divider, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Form from "../../components/searchendpoints/Form";
import { authenticatedPage } from "../../lib/pageHelpers";
import { apiRequest } from "../../lib/api";
import {
  formatSearchEndpoint,
  getSearchEndpoint,
} from "../../lib/searchendpoints";
import { ExposedSearchEndpoint } from "../../lib/searchendpoints/types/ExposedSearchEndpoint";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const searchEndpoint = await getSearchEndpoint(
    context.user,
    context.params!.id as string,
    { projects: true }
  );
  if (!searchEndpoint) {
    return { notFound: true };
  }
  return {
    props: {
      searchEndpoint: formatSearchEndpoint(searchEndpoint),
      hasAssociatedProjects: searchEndpoint.projects.length > 0,
    },
  };
});

type Props = {
  searchEndpoint: ExposedSearchEndpoint;
  hasAssociatedProjects: boolean;
};

const RemoveErr = Z.object({
  error: Z.string(),
});

const useStyles = makeStyles(() => ({
  wrapper: {
    height: "100%",
  },
}));

export default function EditSearchEndpoint({
  searchEndpoint,
  hasAssociatedProjects,
}: Props) {
  const [testResultModalOpen, setTestResultModalOpen] = React.useState(false);
  const [connectionTestResult, setConnectionTestResult] = React.useState<
    | {
        success: boolean;
        title: string;
        message: string;
      }
    | undefined
  >();

  const classes = useStyles();
  const router = useRouter();

  async function onSubmit(values: ExposedSearchEndpoint) {
    if (values.testConnection) {
      const { hasCredentials, ...editableFields } = values;
      const result = await apiRequest(
        `/api/searchendpoints/connection`,
        editableFields,
        { method: "POST" }
      );
      setConnectionTestResult({
        success: result.success,
        title: `Connection ${result.success ? "successful" : "failed"}`,
        message: result.message,
      });
      setTestResultModalOpen(true);
      return false;
    }

    const { id, orgId, type, hasCredentials, ...editableFields } = values;
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
    const r = confirm("Are you sure, you want to delete the search endpoint?");

    if (!r) {
      return;
    }

    try {
      await apiRequest(
        `/api/searchendpoints/${searchEndpoint.id}`,
        {},
        { method: "DELETE" }
      );
      router.push("/searchendpoints");
    } catch (e) {
      const title = "Delete failed";

      try {
        setConnectionTestResult({
          success: false,
          title: title,
          message: RemoveErr.parse(JSON.parse(e.message)).error,
        });
      } catch {
        setConnectionTestResult({
          success: false,
          title: title,
          message: "Unable to remove endpoint",
        });
      }
      setTestResultModalOpen(true);
    }
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
          removable={!hasAssociatedProjects}
          removeMessage={
            hasAssociatedProjects
              ? "Search endpoint is associated with one or more projects"
              : undefined
          }
          resultModalOpen={testResultModalOpen}
          resultMessage={connectionTestResult}
          setResultModalOpen={setTestResultModalOpen}
          initialValues={searchEndpoint}
        />
      </Container>
    </div>
  );
}
