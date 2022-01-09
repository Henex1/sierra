import React from "react";
import { useRouter } from "next/router";

import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

import { listSearchEndpoints } from "../../lib/searchendpoints";
import { ExposedSearchEndpoint } from "../../lib/searchendpoints/types/ExposedSearchEndpoint";
import { create as createSearchEndpoint } from "../searchendpoints/create";
import { authenticatedPage } from "../../lib/pageHelpers";
import { apiRequest } from "../../lib/api";
import { useActiveOrg, useSession } from "../../components/Session";
import { NewProject, ProjectForm } from "../../components/projects/Form";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const searchEndpoints = await listSearchEndpoints(context);
  return { props: { searchEndpoints } };
});

type Props = {
  searchEndpoints: ExposedSearchEndpoint[];
};

export default function CreateProject({ searchEndpoints }: Props) {
  const router = useRouter();
  const { refresh: refreshSession } = useSession();
  const { activeOrg } = useActiveOrg();

  const onSubmit = React.useCallback(
    async (values: NewProject) => {
      let searchEndpointId = values.searchEndpointId;
      if (values.searchEndpointId === "-1" && values.searchEndpoint) {
        const { searchEndpoint } = await createSearchEndpoint(
          values.searchEndpoint
        );
        searchEndpointId = searchEndpoint.id;
      }

      await apiRequest(`/api/projects/create`, {
        name: values.name,
        orgId: activeOrg?.id,
        searchEndpointId,
      });
      router.push("/projects");
      // Reload the global projects list dropdown
      refreshSession();
      // Keep the form stuck as pending
      return new Promise(() => {});
    },
    [refreshSession]
  );

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Typography>New Project</Typography>
      </BreadcrumbsButtons>
      <Container maxWidth="sm">
        <ProjectForm onSubmit={onSubmit} endpoints={searchEndpoints} />
      </Container>
    </div>
  );
}
