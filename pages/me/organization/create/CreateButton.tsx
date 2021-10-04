import React, { ReactElement } from "react";
import Button from "@material-ui/core/Button";
import { useRouter } from "next/router";

export const CreateButton = (): ReactElement => {
  const router = useRouter();
  return (
    <Button
      color="primary"
      variant="contained"
      onClick={() => router.push(`/me/organization/create`)}
      title="Create new organization"
    >
      Create
    </Button>
  );
};

export default CreateButton;
