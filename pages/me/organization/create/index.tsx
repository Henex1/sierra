import * as React from "react";

import Typography from "@material-ui/core/Typography";
import { Grid } from "@material-ui/core";

import BreadcrumbsButtons from "../../../../components/common/BreadcrumbsButtons";
import Link from "../../../../components/common/Link";
import { ExposedOrg } from "../../../../lib/org";
import CreateOrganizationForm from "../../../../components/organization/CreateOrganizationForm";
import { apiRequest } from "../../../../lib/api";
import { useRouter } from "next/router";

export default function CreateOrganization() {
  const router = useRouter();

  async function onSubmit({ name, image, domain }: ExposedOrg) {
    return apiRequest(`/api/organization/create`, {
      name,
      domain,
      image: image || undefined,
    }).then(() => router.push("/me/organizations"));
  }

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/me/organization">Organization</Link>
        <Typography>Create Organization</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6">Organization details</Typography>
        </Grid>
        <Grid item xs={7}>
          <CreateOrganizationForm onSubmit={onSubmit} />
        </Grid>
      </Grid>
    </div>
  );
}
