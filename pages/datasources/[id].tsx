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

import Form from "../../components/datasources/Form";
import Link from "../../components/common/Link";
import { getUser } from "../../lib/auth";
import { getDatasource, ExposedDatasource } from "../../lib/datasources";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getUser(context.req);
  const datasource = session.user
    ? await getDatasource(session.user, context.params!.id as string)
    : null;
  return { props: { datasource } };
};

type Props = {
  datasource: ExposedDatasource;
};

export default function Datasources({ datasource }: Props) {
  const router = useRouter();

  async function onSubmit(values: ExposedDatasource) {
    const { id, orgId, type, ...editableFields } = values;
    const response = await fetch(`/api/datasources/${datasource.id}`, {
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
    router.push("/datasources");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  async function onDelete() {
    const response = await fetch(`/api/datasources/${datasource.id}`, {
      method: "DELETE",
    });
    const body = await response.json();
    if (!response.ok) {
      // XXX - do something about this
      throw new Error(JSON.stringify(body));
    }
    router.push("/datasources");
    // Keep the form stuck as pending
    return new Promise(() => {});
  }

  return (
    <Container maxWidth="sm">
      <Form
        onSubmit={onSubmit}
        onDelete={onDelete}
        initialValues={datasource}
      />
    </Container>
  );
}
