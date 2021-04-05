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
import {
  getSearchEndpoint,
  ExposedSearchEndpoint,
} from "../../lib/searchendpoints";

export const getServerSideProps = authenticatedPage(async (context) => {
  const searchEndpoint = await getSearchEndpoint(
    context.user,
    context.params!.id as string
  );
  return { props: { searchEndpoint } };
});

type Props = {
  searchEndpoint: ExposedSearchEndpoint;
};

export default function EditSearchEndpoint({ searchEndpoint }: Props) {
  const router = useRouter();

  async function onSubmit(values: ExposedSearchEndpoint) {
    const { id, orgId, type, ...editableFields } = values;
    const response = await fetch(`/api/searchendpoints/${searchEndpoint.id}`, {
      method: "PATCH",
      body: JSON.stringify(editableFields),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.json();
    if (!response.ok) {
      // XXX - do something about this
      throw new Error(JSON.stringify(body));
    }
    router.push("/searchendpoints");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  async function onDelete() {
    const response = await fetch(`/api/searchendpoints/${searchEndpoint.id}`, {
      method: "DELETE",
    });
    const body = await response.json();
    if (!response.ok) {
      // XXX - do something about this
      throw new Error(JSON.stringify(body));
    }
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
