import * as React from "react";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getSession } from "next-auth/client";
import { useTable } from "react-table";

import Form from "../../components/searchendpoints/Form";
import Link from "../../components/common/Link";
import { authenticatedPage } from "../../lib/auth";
import { apiRequest } from "../../lib/api";
import {
  formatSearchEndpoint,
  getSearchEndpoint,
  ExposedSearchEndpoint,
} from "../../lib/searchendpoints";

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

export default function EditSearchEndpoint({ searchEndpoint }: Props) {
  const router = useRouter();

  async function onSubmit(values: ExposedSearchEndpoint) {
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
    <Container maxWidth="sm">
      <Form
        onSubmit={onSubmit}
        onDelete={onDelete}
        initialValues={searchEndpoint}
      />
    </Container>
  );
}
