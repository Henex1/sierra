import * as React from "react";
import { GetServerSideProps } from "next";
import { useTable, Column } from "react-table";

import { Typography } from "@material-ui/core";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Grid from "@material-ui/core/Grid";

import Link, { LinkButton } from "../../components/common/Link";
import { useActiveProject } from "../../components/Session";
import { authenticatedPage } from "../../lib/pageHelpers";
import { redirectToLogin } from "../../lib/errors";
import {
  userCanAccessRuleset,
  formatRuleset,
  ExposedRuleset,
} from "../../lib/rulesets";
import prisma from "../../lib/prisma";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const rulesets = await prisma.ruleset.findMany({
    where: userCanAccessRuleset(context.user),
  });
  return { props: { rulesets: rulesets.map(formatRuleset) } };
});

type Props = {
  rulesets: ExposedRuleset[];
};

export default function Rulesets({ rulesets }: Props) {
  const { project } = useActiveProject();

  const columns: Column<ExposedRuleset>[] = React.useMemo(
    () => [
      {
        Header: "Name",
        Cell: ({ row }) => (
          <Link href={`/rulesets/${row.original.id}`}>{row.original.name}</Link>
        ),
        accessor: "name",
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data: rulesets });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div style={{ height: "90%" }}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Rulesets</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Rulesets</Typography>
        </Grid>
        {!project && (
          <Grid item xs={6} style={{ margin: "0 auto", textAlign: "center" }}>
            <Typography variant="h6">No project is active</Typography>
            <Typography variant="subtitle1">
              You must setup or activate project first
            </Typography>
          </Grid>
        )}
        {project && (
          <>
            <LinkButton href="/rulesets/create" variant="contained">
              Add ruleset
            </LinkButton>
            <MaUTable {...getTableProps()}>
              <TableHead>
                {headerGroups.map((headerGroup) => (
                  <TableRow {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <TableCell {...column.getHeaderProps()}>
                        {column.render("Header")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <TableRow {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <TableCell {...cell.getCellProps()}>
                          {cell.render("Cell")}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </MaUTable>
          </>
        )}
      </Grid>
    </div>
  );
}
