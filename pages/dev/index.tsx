import * as React from "react";
import Head from "next/head";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { authenticatedPage } from "../../lib/pageHelpers";
import { apiRequest } from "../../lib/api";

export const getServerSideProps = authenticatedPage();

export default function Dev() {
  async function doMutate(name: string) {
    try {
      await apiRequest(`/api/dev/${name}`, {});
      // Full page reload because it's easy and this is dev.
      window.location.reload();
    } catch (err) {
      alert("Action failed, check console.");
      throw err;
    }
  }
  return (
    <div>
      <Head>
        <title>Development Page</title>
      </Head>
      This page is available because{" "}
      <code>NODE_ENV={process.env.NODE_ENV}</code>. It is not available in{" "}
      <code>production</code>.
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Function</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              Create a Search Endpoint pointing to the Elasticsearch server
              listed in <code>docker-compose.local.yml</code>. Create a
              populated Project referencing the Search Endpoint.
            </TableCell>
            <TableCell>
              <Button variant="contained" onClick={() => doMutate("seed")}>
                Seed
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
