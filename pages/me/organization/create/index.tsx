import * as React from "react";

import Typography from "@material-ui/core/Typography";
import { Grid } from "@material-ui/core";

import BreadcrumbsButtons from "../../../../components/common/BreadcrumbsButtons";
import Link from "../../../../components/common/Link";
import {
  CreateOrganizationForm,
  FormProps,
} from "../../../../components/organization/CreateOrganizationForm";
import { apiRequest } from "../../../../lib/api";
import { useRouter } from "next/router";
import { useSession } from "../../../../components/Session";

export default function CreateOrganization() {
  const router = useRouter();
  const { refresh } = useSession();
  const onSubmit: FormProps["onSubmit"] = async ({
    name,
    image,
    domain,
    bgColor,
    textColor,
  }) => {
    return apiRequest(`/api/organization/create`, {
      name,
      domain,
      image,
      bgColor,
      textColor,
    }).then(() => {
      refresh();
      router.push("/me");
    });
  };

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/me">Organization</Link>
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
